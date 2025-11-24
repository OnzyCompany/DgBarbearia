/**
 * ATENÇÃO: Este código roda no SERVIDOR do Google (Firebase Functions).
 * Você precisa fazer deploy dele usando 'firebase deploy --only functions'.
 * Ele não roda no navegador.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// 1. Enviar Notificação Individual
exports.enviarNotificacao = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const { title, body, icon, userId, url } = req.body;

  if (!title || !body || !userId) {
    res.status(400).send({ error: "Missing title, body or userId" });
    return;
  }

  try {
    // Buscar tokens do usuário
    const tokensSnap = await admin.firestore()
      .collection("users_notifications")
      .where("userId", "==", userId)
      .get();

    if (tokensSnap.empty) {
      res.status(404).send({ message: "User has no registered tokens" });
      return;
    }

    const tokens = tokensSnap.docs.map(doc => doc.data().token);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        notification: {
          icon: icon || "https://cdn-icons-png.flaticon.com/512/1000/1000627.png",
          data: { url: url || "/" }
        }
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).send({ success: true, results: response });

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ error: error.message });
  }
});

// 2. Enviar Para Todos (Broadcast)
exports.enviarParaTodos = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const { title, body, icon, url } = req.body;

  try {
    // Pegar TODOS os tokens (Em produção, faça isso em lotes de 500)
    const tokensSnap = await admin.firestore().collection("users_notifications").get();
    
    if (tokensSnap.empty) {
      res.status(200).send({ message: "No devices registered" });
      return;
    }

    const tokens = tokensSnap.docs.map(doc => doc.data().token);

    // Enviar em lotes de 500 (limite do Firebase)
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500));
    }

    const promises = chunks.map(chunkTokens => {
      const message = {
        notification: { title, body },
        webpush: {
          notification: {
            icon: icon || "https://cdn-icons-png.flaticon.com/512/1000/1000627.png",
            data: { url: url || "/" }
          }
        },
        tokens: chunkTokens,
      };
      return admin.messaging().sendEachForMulticast(message);
    });

    await Promise.all(promises);
    res.status(200).send({ success: true, message: `Sent to ${tokens.length} devices` });

  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).send({ error: error.message });
  }
});