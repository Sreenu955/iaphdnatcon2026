const net = require('net');
const tls = require('tls');

console.log("=== SMTP DIAGNOSTIC TOOL FOR IAPHD NATCON 2026 (NODE.JS) ===\n");

const host = "smtp.gmail.com";
const user = "ambidexevents@gmail.com";
const pass = "belkljgyvoegyuiw";
const testRecipient = "ambidexevents@gmail.com";

function testPort465() {
  console.log("--- TESTING PORT 465 (SSL/TLS) ---");
  console.log(`Connecting to ${host}:465 via SSL/TLS...`);
  
  const socket = tls.connect(465, host, { rejectUnauthorized: false }, () => {
    console.log("✅ Connected successfully! Reading server greeting...");
  });

  socket.setEncoding('utf-8');

  let step = 0;
  
  // Set a timeout to proceed to 587 if it hangs
  const connectionTimeout = setTimeout(() => {
    console.log("❌ CONNECTION TIMEOUT on Port 465 after 10s.\n");
    socket.destroy();
    testPort587();
  }, 10000);

  socket.on('data', (data) => {
    console.log("   <- " + data.trim().replace(/\r\n/g, "\n   <- "));
    
    const hasCode = (code) => new RegExp(`(^|\\r?\\n)${code}\\b`).test(data);

    if (step === 0 && hasCode("220")) {
      clearTimeout(connectionTimeout);
      step++;
      console.log("Sending EHLO...");
      socket.write("EHLO localhost\r\n");
    } else if (step === 1 && hasCode("250")) {
      step++;
      console.log("Sending AUTH LOGIN...");
      socket.write("AUTH LOGIN\r\n");
    } else if (step === 2 && hasCode("334")) {
      step++;
      console.log("Sending username (base64)...");
      socket.write(Buffer.from(user).toString('base64') + "\r\n");
    } else if (step === 3 && hasCode("334")) {
      step++;
      console.log("Sending password (base64)...");
      socket.write(Buffer.from(pass).toString('base64') + "\r\n");
    } else if (step === 4) {
      if (hasCode("235")) {
        step++;
        console.log("🎉 SUCCESS! Authenticated successfully!");
        console.log("Sending MAIL FROM...");
        socket.write(`MAIL FROM:<${user}>\r\n`);
      } else if (hasCode("535")) {
        console.log("❌ AUTHENTICATION FAILED: Gmail rejected the app password. (Bad Credentials)");
        socket.destroy();
        testPort587();
      }
    } else if (step === 5 && hasCode("250")) {
      step++;
      console.log("Sending RCPT TO...");
      socket.write(`RCPT TO:<${testRecipient}>\r\n`);
    } else if (step === 6 && hasCode("250")) {
      step++;
      console.log("Sending DATA...");
      socket.write("DATA\r\n");
    } else if (step === 7 && hasCode("354")) {
      step++;
      console.log("Sending message headers & body...");
      const subject = "Node SMTP Diagnostic Test - " + new Date().toISOString();
      const headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        `From: IAPHD NATCON 2026 <${user}>`,
        `To: ${testRecipient}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        `Date: ${new Date().toUTCString()}`,
        "\r\n"
      ].join("\r\n");
      const body = "<h2>SMTP Diagnostic Test</h2><p>Gmail SMTP is working perfectly from your local machine!</p>";
      socket.write(headers + body + "\r\n.\r\n");
    } else if (step === 8 && hasCode("250")) {
      step++;
      console.log("Sending QUIT...");
      socket.write("QUIT\r\n");
      console.log("\n🎉 SMTP TEST COMPLETED SUCCESSFULLY! Email was sent.");
      socket.destroy();
    }
  });

  socket.on('error', (err) => {
    clearTimeout(connectionTimeout);
    console.log(`❌ CONNECTION FAILED on Port 465: ${err.message}\n`);
    testPort587();
  });
}

function testPort587() {
  console.log("--- TESTING PORT 587 (TLS/STARTTLS) ---");
  console.log(`Connecting to ${host}:587 via plain TCP...`);
  
  const socket = net.createConnection(587, host, () => {
    console.log("✅ Connected successfully! Reading server greeting...");
  });

  socket.setEncoding('utf-8');

  let step = 0;
  let secureSocket;

  // Set a timeout to proceed to exit if it hangs
  const connectionTimeout = setTimeout(() => {
    console.log("❌ CONNECTION TIMEOUT on Port 587 after 10s.\n");
    socket.destroy();
    process.exit(1);
  }, 10000);

  socket.on('data', (data) => {
    console.log("   <- " + data.trim().replace(/\r\n/g, "\n   <- "));
    
    if (step === 0 && data.includes("220")) {
      clearTimeout(connectionTimeout);
      step++;
      console.log("Sending EHLO...");
      socket.write("EHLO localhost\r\n");
    } else if (step === 1 && data.includes("250")) {
      step++;
      console.log("Sending STARTTLS...");
      socket.write("STARTTLS\r\n");
    } else if (step === 2 && data.includes("220")) {
      step++;
      console.log("Upgrading connection to TLS...");
      
      secureSocket = tls.connect({
        socket: socket,
        host: host,
        port: 587,
        rejectUnauthorized: false
      }, () => {
        console.log("✅ Connection upgraded to TLS! Sending EHLO post-TLS...");
        secureSocket.write("EHLO localhost\r\n");
      });

      secureSocket.setEncoding('utf-8');

      secureSocket.on('data', (secData) => {
        console.log("   <- " + secData.trim().replace(/\r\n/g, "\n   <- "));
        
        if (step === 3 && secData.includes("250")) {
          step++;
          console.log("Sending AUTH LOGIN...");
          secureSocket.write("AUTH LOGIN\r\n");
        } else if (step === 4 && secData.includes("334")) {
          step++;
          console.log("Sending username (base64)...");
          secureSocket.write(Buffer.from(user).toString('base64') + "\r\n");
        } else if (step === 5 && secData.includes("334")) {
          step++;
          console.log("Sending password (base64)...");
          secureSocket.write(Buffer.from(pass).toString('base64') + "\r\n");
        } else if (step === 6 && secData.includes("235")) {
          step++;
          console.log("🎉 SUCCESS! Authenticated successfully via TLS!");
          console.log("Sending MAIL FROM...");
          secureSocket.write(`MAIL FROM:<${user}>\r\n`);
        } else if (step === 7 && secData.includes("250")) {
          step++;
          console.log("Sending RCPT TO...");
          secureSocket.write(`RCPT TO:<${testRecipient}>\r\n`);
        } else if (step === 8 && secData.includes("250")) {
          step++;
          console.log("Sending DATA...");
          secureSocket.write("DATA\r\n");
        } else if (step === 9 && secData.includes("354")) {
          step++;
          console.log("Sending message headers & body...");
          const subject = "Node SMTP STARTTLS Diagnostic Test - " + new Date().toISOString();
          const headers = [
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            `From: IAPHD NATCON 2026 <${user}>`,
            `To: ${testRecipient}`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
            `Date: ${new Date().toUTCString()}`,
            "\r\n"
          ].join("\r\n");
          const body = "<h2>SMTP STARTTLS Diagnostic Test</h2><p>Gmail SMTP via TLS is working perfectly from your local machine!</p>";
          secureSocket.write(headers + body + "\r\n.\r\n");
        } else if (step === 10 && secData.includes("250")) {
          step++;
          console.log("Sending QUIT...");
          secureSocket.write("QUIT\r\n");
          console.log("\n🎉 SMTP TLS TEST COMPLETED SUCCESSFULLY! Email was sent.");
          secureSocket.destroy();
          socket.destroy();
        }
      });

      secureSocket.on('error', (err) => {
        console.log(`❌ SECURE SOCKET ERROR: ${err.message}\n`);
        secureSocket.destroy();
        socket.destroy();
      });
    }
  });

  socket.on('error', (err) => {
    clearTimeout(connectionTimeout);
    console.log(`❌ CONNECTION FAILED on Port 587: ${err.message}\n`);
    socket.destroy();
  });
}

testPort465();
