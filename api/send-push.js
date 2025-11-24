import admin from 'firebase-admin';

// Inicializa o Admin SDK apenas uma vez
if (!admin.apps.length) {
  // Tenta limpar a chave privada de quebras de linha escapadas (comum em env vars)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    console.error("Faltam variáveis de ambiente do Firebase Admin (FIREBASE_PRIVATE_KEY, etc)");
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ error: 'Firebase Admin não inicializado. Verifique as variáveis de ambiente na Vercel.' });
  }

  const { title, body, icon, url } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
  }

  try {
    const db = admin.firestore();
    // Pegar TODOS os tokens registrados
    const tokensSnap = await db.collection("users_notifications").get();
    
    if (tokensSnap.empty) {
      return res.status(200).json({ message: "Nenhum dispositivo registrado para receber notificação." });
    }

    // Extrair tokens limpos
    const tokens = tokensSnap.docs
      .map(doc => doc.data().token)
      .filter(token => token && typeof token === 'string');

    if (tokens.length === 0) {
        return res.status(200).json({ message: "Lista de tokens válida vazia." });
    }

    console.log(`Enviando para ${tokens.length} dispositivos...`);

    // Enviar em lotes de 500 (limite do Firebase)
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500));
    }

    const promises = chunks.map(chunkTokens => {
      const message = {
        notification: { title, body },
        // Configurações Críticas para Background e Mobile
        android: {
          priority: 'high',
          notification: {
            icon: 'stock_ticker_update', // Usar ícone padrão do sistema ou customizado se houver
            color: '#D4A853',
            clickAction: url || '/',
            priority: 'max', // Prioridade máxima na UI do Android
            defaultSound: true,
            visibility: 'public'
          }
        },
        webpush: {
          headers: {
            Urgency: 'high' // Cabeçalho HTTP para WebPush
          },
          fcmOptions: {
            link: url || '/'
          },
          notification: {
            icon: icon || "https://cdn-icons-png.flaticon.com/512/1000/1000627.png",
            requireInteraction: true, // Faz a notificação ficar na tela até o usuário clicar
            data: { url: url || "/" }
          }
        },
        tokens: chunkTokens,
      };
      return admin.messaging().sendEachForMulticast(message);
    });

    const results = await Promise.all(promises);
    
    // Contar sucessos e falhas
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach(batch => {
        successCount += batch.successCount;
        failureCount += batch.failureCount;
    });

    return res.status(200).json({ 
        success: true, 
        message: `Enviado com sucesso para ${successCount} dispositivos. Falhas: ${failureCount}`,
        details: { successCount, failureCount }
    });

  } catch (error) {
    console.error("Erro no broadcast:", error);
    return res.status(500).json({ error: error.message });
  }
}