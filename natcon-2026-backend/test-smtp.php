<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain; charset=UTF-8");

echo "=== SMTP DIAGNOSTIC TOOL FOR IAPHD NATCON 2026 ===\n\n";

$smtp_host = "smtp.gmail.com";
$smtp_user = "ambidexevents@gmail.com";
$smtp_pass = "belk ljgy voeg yuiw";
$test_recipient = "ambidexevents@gmail.com"; // Test send to self

function run_smtp_test($host, $port, $user, $pass, $to) {
    $timeout = 10;
    $secure_prefix = ($port == 465) ? "ssl://" : "";
    echo "Attempting connection to {$secure_prefix}{$host} on port {$port}...\n";
    
    $socket = @fsockopen($secure_prefix . $host, $port, $errno, $errstr, $timeout);
    
    if (!$socket) {
        echo "❌ CONNECTION FAILED: {$errstr} ({$errno})\n\n";
        return false;
    }
    
    echo "✅ Connected successfully! Reading server response...\n";
    
    $read_response = function($sock, $expected) {
        $response = "";
        while (substr($response, 3, 1) != ' ') {
            $line = fgets($sock, 512);
            if ($line === false) break;
            $response .= $line;
        }
        $code = substr($response, 0, 3);
        echo "   <- " . trim($response) . "\n";
        if ($code != $expected) {
            echo "   ❌ ERROR: Expected code {$expected}, but got {$code}\n";
            return false;
        }
        return true;
    };
    
    if (!$read_response($socket, '220')) { fclose($socket); return false; }
    
    echo "Sending EHLO...\n";
    fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? "localhost") . "\r\n");
    if (!$read_response($socket, '250')) { fclose($socket); return false; }
    
    if ($port == 587) {
        echo "Initiating STARTTLS...\n";
        fwrite($socket, "STARTTLS\r\n");
        if (!$read_response($socket, '220')) { fclose($socket); return false; }
        
        echo "Enabling TLS encryption...\n";
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            echo "   ❌ ERROR: Failed to enable TLS encryption on socket.\n";
            fclose($socket);
            return false;
        }
        
        echo "Sending EHLO post-TLS...\n";
        fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? "localhost") . "\r\n");
        if (!$read_response($socket, '250')) { fclose($socket); return false; }
    }
    
    echo "Sending AUTH LOGIN...\n";
    fwrite($socket, "AUTH LOGIN\r\n");
    if (!$read_response($socket, '334')) { fclose($socket); return false; }
    
    echo "Sending username (base64)...\n";
    fwrite($socket, base64_encode($user) . "\r\n");
    if (!$read_response($socket, '334')) { fclose($socket); return false; }
    
    echo "Sending password (base64)...\n";
    fwrite($socket, base64_encode($pass) . "\r\n");
    if (!$read_response($socket, '235')) { fclose($socket); return false; }
    
    echo "Sending MAIL FROM...\n";
    fwrite($socket, "MAIL FROM:<{$user}>\r\n");
    if (!$read_response($socket, '250')) { fclose($socket); return false; }
    
    echo "Sending RCPT TO...\n";
    fwrite($socket, "RCPT TO:<{$to}>\r\n");
    if (!$read_response($socket, '250')) { fclose($socket); return false; }
    
    echo "Sending DATA...\n";
    fwrite($socket, "DATA\r\n");
    if (!$read_response($socket, '354')) { fclose($socket); return false; }
    
    $subject = "SMTP Diagnostic Test - " . date('Y-m-d H:i:s');
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: IAPHD NATCON 2026 <{$user}>\r\n";
    $headers .= "To: {$to}\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "\r\n";
    
    $body = "<h2>SMTP Diagnostic Test</h2><p>If you are reading this, Gmail SMTP is working perfectly from your Hostinger server!</p>";
    
    fwrite($socket, $headers . $body . "\r\n.\r\n");
    if (!$read_response($socket, '250')) { fclose($socket); return false; }
    
    echo "Sending QUIT...\n";
    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    
    echo "\n🎉 SMTP TEST COMPLETED SUCCESSFULLY! Email was sent.\n\n";
    return true;
}

echo "--- TESTING PORT 465 (SSL) ---\n";
$success_465 = run_smtp_test($smtp_host, 465, $smtp_user, $smtp_pass, $test_recipient);

if (!$success_465) {
    echo "--- TESTING PORT 587 (TLS/STARTTLS) ---\n";
    $success_587 = run_smtp_test($smtp_host, 587, $smtp_user, $smtp_pass, $test_recipient);
    
    if (!$success_587) {
        echo "❌ BOTH SMTP TESTS FAILED.\n";
        echo "Possible reasons:\n";
        echo "1. Hostinger firewall blocks outgoing SMTP connections to external servers (smtp.gmail.com).\n";
        echo "2. OpenSSL extension is disabled in your PHP configuration.\n";
        echo "3. The Gmail account has security settings or the App Password is invalid.\n\n";
    } else {
        echo "💡 RECOMMENDATION: Change the SMTP port in api.php to 587!\n\n";
    }
}
