<?php
// Secure PHP REST API for IAPHD NATCON 2026 on Hostinger Shared Hosting
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight CORS requests gracefully
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ── 1. DATABASE CONFIGURATION ─────────────────────────────────────────────
$host = "localhost";
$db_name = "u695381285_natcon2026";

// Automatically detect local environment (XAMPP / localhost) vs Hostinger production server
$is_local = (
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' || 
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
    in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'])
);

if ($is_local) {
    $username = "root";
    $password = ""; // XAMPP default password is empty
} else {
    // Production (Hostinger) credentials
    $username = "u695381285_natcon2026";
    $password = "Admin@1225";
}

// ── 2. SMTP MAIL CONFIGURATION ─────────────────────────────────────────────
// Configure your professional SMTP server details (Gmail App Password, Hostinger SMTP, etc.):
$smtp_host = "smtp.gmail.com";              // e.g. smtp.hostinger.com or smtp.gmail.com
$smtp_port = 587;                           // 465 (SSL) or 587 (TLS)
$smtp_user = "ambidexevents@gmail.com";
$smtp_pass = "belkljgyvoegyviw";                            // Insert Gmail App Password or SMTP password here
$smtp_auth = true;                          // Set to true to use secure SMTP sockets

function php_convert_number_to_words_recursive($n) {
    $a = array('', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN');
    $b = array('', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY');

    if ($n < 20) return $a[$n];
    if ($n < 100) return $b[floor($n / 10)] . ($n % 10 !== 0 ? ' ' . $a[$n % 10] : '');
    if ($n < 1000) return $a[floor($n / 100)] . ' HUNDRED' . ($n % 100 !== 0 ? ' AND ' . php_convert_number_to_words_recursive($n % 100) : '');
    if ($n < 100000) return php_convert_number_to_words_recursive(floor($n / 1000)) . ' THOUSAND' . ($n % 1000 !== 0 ? ' ' . php_convert_number_to_words_recursive($n % 1000) : '');
    if ($n < 10000000) return php_convert_number_to_words_recursive(floor($n / 100000)) . ' LAKH' . ($n % 100000 !== 0 ? ' ' . php_convert_number_to_words_recursive($n % 100000) : '');
    return php_convert_number_to_words_recursive(floor($n / 10000000)) . ' CRORE' . ($n % 10000000 !== 0 ? ' ' . php_convert_number_to_words_recursive($n % 10000000) : '');
}

function php_number_to_words($num) {
    $amount = intval($num);
    if ($amount === 0) return 'ZERO';
    return php_convert_number_to_words_recursive($amount) . ' ONLY';
}

function generate_receipt_image($record) {
    // 1. Template path
    $template_path = __DIR__ . '/NATCON2026-Receipt.png';
    if (!file_exists($template_path)) {
        return null;
    }

    // 2. Load the PNG template
    $im = @imagecreatefrompng($template_path);
    if (!$im) {
        return null;
    }

    // Enable alpha blending and save alpha channel
    imagealphablending($im, true);
    imagesavealpha($im, true);

    // 3. Define text color resources (RGB matches)
    $blue_color = imagecolorallocate($im, 15, 76, 129);   // #0f4c81
    $dark_blue = imagecolorallocate($im, 12, 35, 64);     // #0c2340
    $dark_gray = imagecolorallocate($im, 45, 55, 72);     // #2d3748
    $black_color = imagecolorallocate($im, 26, 32, 44);   // #1a202c

    // 4. Define font files
    $font_bold = __DIR__ . '/Poppins-Bold.ttf';
    $font_medium = __DIR__ . '/Poppins-Medium.ttf';
    $font_cursive = __DIR__ . '/Playball-Regular.ttf';

    // Verify fonts exist, if not fallback to system font paths or standard built-in
    $fonts_ok = (file_exists($font_bold) && file_exists($font_medium) && file_exists($font_cursive));

    // 5. Format parameters
    $receipt_id = $record['id'];
    $payment_date = !empty($record['paymentDate']) 
        ? date('d/m/Y', strtotime($record['paymentDate'])) 
        : date('d/m/Y');
    $full_name = "Dr. " . strtoupper($record['fullName']);
    $amount_words = php_number_to_words($record['amountPaid']);
    
    $transaction_id = $record['transactionId'];
    $trans_text = $transaction_id
        ? "ONLINE TRANSACTION (REF: " . $transaction_id . ")"
        : "DIRECT BANK TRANSFER (MANUAL)";
    $trans_text .= " (" . $record['category'] . " - " . strtoupper($record['tier']) . ")";

    $amount_formatted = number_format($record['amountPaid']) . "/-";

    if ($fonts_ok) {
        // Draw using TTF fonts
        // Receipt No: top: 34.7% (y=327+26=353), left: 7.9% (x=158)
        imagettftext($im, 26, 0, 158, 353, $blue_color, $font_bold, $receipt_id);

        // Date: top: 33.8% (y=319+26=345), left: 79.7% (x=1593)
        imagettftext($im, 26, 0, 1593, 345, $blue_color, $font_bold, $payment_date);

        // Received with thanks from Name: top: 42.8% (y=404+35=439), left: 26.5% (x=530)
        imagettftext($im, 40, 0, 530, 439, $dark_blue, $font_cursive, $full_name);

        // The sum of rupees Words: top: 51.7% (y=488+24=512), left: 21% (x=420)
        imagettftext($im, 22, 0, 420, 512, $black_color, $font_bold, $amount_words);

        // By transaction/category/tier details: top: 60.2% (y=568+20=588), left: 7.2% (x=144)
        imagettftext($im, 18, 0, 144, 588, $dark_gray, $font_medium, $trans_text);

        // Total Fee Box Amount: top: 91% (y=858+30=888), left: 6% (x=120)
        imagettftext($im, 30, 0, 120, 888, $black_color, $font_bold, $amount_formatted);
    } else {
        // Fallback to built-in PHP fonts if TTF fails (failsafe, though TTF fonts are verified in directory)
        imagestring($im, 5, 158, 335, $receipt_id, $blue_color);
        imagestring($im, 5, 1593, 325, $payment_date, $blue_color);
        imagestring($im, 5, 530, 415, $full_name, $dark_blue);
        imagestring($im, 5, 420, 495, $amount_words, $black_color);
        imagestring($im, 4, 144, 575, $trans_text, $dark_gray);
        imagestring($im, 5, 120, 865, $amount_formatted, $black_color);
    }

    // 6. Write image to uploads directory
    $uploads_dir = __DIR__ . '/uploads';
    if (!file_exists($uploads_dir)) {
        @mkdir($uploads_dir, 0777, true);
    }

    $temp_filename = $uploads_dir . '/receipt_' . $receipt_id . '_' . uniqid() . '.png';
    if (@imagepng($im, $temp_filename)) {
        imagedestroy($im);
        return $temp_filename;
    }

    imagedestroy($im);
    return null;
}

function get_setting($conn, $key) {
    try {
        $stmt = $conn->prepare("SELECT `value` FROM settings WHERE `key` = :key LIMIT 1");
        $stmt->bindParam(':key', $key);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? json_decode($row['value'], true) : null;
    } catch (PDOException $e) {
        return null;
    }
}

function get_absolute_logo_url($logo_path) {
    if (empty($logo_path)) {
        return '';
    }
    if (strpos($logo_path, 'http://') === 0 || strpos($logo_path, 'https://') === 0) {
        return $logo_path;
    }
    $clean_path = ltrim($logo_path, './');
    
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'] ?? 'www.iaphdnatcon2026.com';
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $dir_path = dirname($uri);
    if ($dir_path === '/' || $dir_path === '\\') {
        $dir_path = '';
    }
    
    if ($host === 'localhost' || $host === '127.0.0.1') {
        $host = 'www.iaphdnatcon2026.com';
        $dir_path = '/natcon-2026-backend';
        $protocol = 'https';
    }
    
    return $protocol . "://" . $host . $dir_path . "/" . $clean_path;
}

function get_email_header_html($conn) {
    // Resolve email header.png to an absolute URL
    $email_header_url = get_absolute_logo_url('emailheader.png');
    
    return "
    <table style='width: 100%; border-collapse: collapse; background-color: #ffffff; text-align: center; margin: 0; padding: 0;'>
        <tr>
            <td style='padding: 0; margin: 0; text-align: center;'>
                <img src='{$email_header_url}' alt='30th IAPHD NATCON 2026' style='width: 100%; max-width: 600px; height: auto; display: block; border: 0; outline: none; margin: 0 auto;' />
            </td>
        </tr>
    </table>";
}

function generate_confirmation_email_html($fullName, $generated_id, $category, $conn) {
    $email_header_url = get_absolute_logo_url('emailheader.png');
    $email_footer_url = get_absolute_logo_url('emailfooter.png');
    
    $is_student = (stripos($category, 'Student') !== false);
    $whatsapp_link = $is_student ? 'https://chat.whatsapp.com/ELeMQjJwwYwJz5cgVbieNQ' : 'https://chat.whatsapp.com/H6DEAhsUwuHlwtFDNhK6Sx';

    return "
    <!DOCTYPE html>
    <html>
    <head>
        <title>30th IAPHD NATCON 2026 Registration Confirmation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #2d3748; margin: 0; padding: 20px 0; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .content { padding: 30px 40px; }
            h2 { color: #1a202c; font-size: 22px; margin-top: 0; }
            p { font-size: 15px; line-height: 1.7; color: #4a5568; margin-bottom: 20px; }
            .highlight-box { background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
            .highlight-box p { margin: 5px 0; color: #2b6cb0; }
            .btn { display: inline-block; background-color: #00A8CC; color: #ffffff !important; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; margin-top: 10px; font-size: 14px; }
            .btn-green { background-color: #25D366; }
            .social-icons { margin-top: 15px; margin-bottom: 30px; }
            .social-icons a { display: inline-block; margin-right: 15px; text-decoration: none; }
            .social-icons img { width: 36px; height: 36px; border: 0; }
            .footer-text { color: #718096; font-size: 13px; margin-top: 30px; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class='wrapper'>
            <div class='container'>
                <img src='{$email_header_url}' alt='30th IAPHD NATCON 2026 Header' style='width: 100%; max-width: 600px; height: auto; display: block; border: 0;' />
                
                <div class='content'>
                    <h2>Registration Confirmed!</h2>
                    <p>Dear Dr. <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
                    <p>Greetings from the Organizing Committee of the 30th IAPHD National Conference 2026! We are pleased to confirm your registration for the upcoming event in Vizag.</p>
                    
                    <div class='highlight-box'>
                        <p><strong>Registration No:</strong> " . htmlspecialchars($generated_id) . "</p>
                        <p><strong>Category:</strong> " . htmlspecialchars($category) . "</p>
                    </div>
                    
                    <p>Thank you for joining us. We look forward to welcoming you to the conference. For more details about the schedule and venue, please visit our official website.</p>
                    <a href='https://iaphdnatcon2026.com/' class='btn'>Visit Website</a>
                    
                    <div style='margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 25px;'>
                        <h3 style='font-size: 16px; color: #2d3748; margin-bottom: 15px;'>Join our WhatsApp Community</h3>
                        <p style='margin-bottom: 15px;'>Stay updated with the latest announcements and connect with other delegates.</p>
                        <a href='{$whatsapp_link}' class='btn btn-green'>Join WhatsApp Group</a>
                    </div>
                    
                    <div style='margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 25px;'>
                        <h3 style='font-size: 16px; color: #2d3748; margin-bottom: 15px;'>Download Your E-Receipt</h3>
                        <p style='margin-bottom: 15px;'>You can download your official payment receipt from our utility portal.</p>
                        <a href='https://iaphdnatcon2026.com/utility' class='btn' style='background-color: #4a5568;'>Download Receipt</a>
                    </div>
                    
                    <div style='margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 25px; text-align: center;'>
                        <h3 style='font-size: 16px; color: #2d3748; margin-bottom: 15px;'>Follow Us</h3>
                        <div class='social-icons'>
                            <a href='https://www.facebook.com/share/1Bqr8GVgv1/?mibextid=wwXlfr'><img src='" . get_absolute_logo_url('facebook.png') . "' alt='Facebook'/></a>
                            <a href='https://www.instagram.com/30th_iaphd_natcon_2026?igsh=MXYyb2Uxc3FhdjFobg%3D%3D&utm_source=qr'><img src='" . get_absolute_logo_url('instagram.png') . "' alt='Instagram'/></a>
                        </div>
                        <p class='footer-text'>Warm regards,<br>Organizing Committee<br>30th IAPHD NATCON 2026</p>
                    </div>
                </div>
                
                <img src='{$email_footer_url}' alt='30th IAPHD NATCON 2026 Footer' style='width: 100%; max-width: 600px; height: auto; display: block; border: 0;' />
            </div>
        </div>
    </body>
    </html>";
}

function confirm_offline_registration_if_needed($conn, $id, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth) {
    // 1. Fetch current registration
    $stmt_find = $conn->prepare("SELECT * FROM registrations WHERE id = :id LIMIT 1");
    $stmt_find->bindParam(':id', $id);
    $stmt_find->execute();
    $record = $stmt_find->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        return array("success" => false, "error" => "Registration record not found.");
    }

    $needs_upgrade = (strpos($id, 'NATCON-') !== 0);
    
    if ($needs_upgrade) {
        // Generate next NATCON-SD-XXX or NATCON-FD-XXX ID
        $is_student = (stripos($record['category'], 'Student') !== false);
        $prefix = $is_student ? 'NATCON-SD-' : 'NATCON-FD-';

        $stmt_count = $conn->prepare("SELECT id FROM registrations WHERE id LIKE :prefix ORDER BY LENGTH(id) DESC, id DESC LIMIT 1");
        $prefix_like = $prefix . '%';
        $stmt_count->bindParam(':prefix', $prefix_like);
        $stmt_count->execute();
        $latest = $stmt_count->fetch(PDO::FETCH_ASSOC);

        if ($latest) {
            $num = intval(str_replace($prefix, '', $latest['id']));
            $next_num = $num + 1;
        } else {
            $next_num = 1;
        }
        $new_id = $prefix . str_pad($next_num, 3, "0", STR_PAD_LEFT);

        // Generate password if empty
        $password = !empty($record['password']) ? $record['password'] : substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 8);

        // Update submissions linked to this registration ID (if any exist)
        $stmt_sub = $conn->prepare("UPDATE submissions SET regId = :new_id WHERE regId = :old_id");
        $stmt_sub->bindParam(':new_id', $new_id);
        $stmt_sub->bindParam(':old_id', $id);
        $stmt_sub->execute();

        // Update registrations
        $stmt_reg = $conn->prepare("UPDATE registrations SET id = :new_id, status = 'CONFIRMED', password = :password WHERE id = :old_id");
        $stmt_reg->bindParam(':new_id', $new_id);
        $stmt_reg->bindParam(':password', $password);
        $stmt_reg->bindParam(':old_id', $id);
        $stmt_reg->execute();

        // Fetch upgraded record for email
        $stmt_new = $conn->prepare("SELECT * FROM registrations WHERE id = :new_id LIMIT 1");
        $stmt_new->bindParam(':new_id', $new_id);
        $stmt_new->execute();
        $updated_record = $stmt_new->fetch(PDO::FETCH_ASSOC);

        // Send Email confirmation
        try {
            $fullName = $updated_record['fullName'];
            $email = $updated_record['email'];
            $city = $updated_record['city'];
            $category = $updated_record['category'];
            $tier = $updated_record['tier'];
            $amountPaid = $updated_record['amountPaid'];
            $paymentDate = !empty($updated_record['paymentDate']) ? $updated_record['paymentDate'] : date('Y-m-d');

            $to = $email;

            $record_data = array(
                'id' => $new_id,
                'fullName' => $fullName,
                'email' => $email,
                'mobile' => $updated_record['mobile'],
                'city' => $city,
                'category' => $category,
                'tier' => $tier,
                'transactionId' => 'OFFLINE_CONFIRMED',
                'amountPaid' => $amountPaid,
                'paymentDate' => $paymentDate,
                'status' => 'CONFIRMED'
            );
            
            $attachment_path = generate_receipt_image($record_data);
            $attachment_name = "E-Receipt_" . $new_id . ".png";
            
            send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth, $attachment_path, $attachment_name);
            
            if ($attachment_path && file_exists($attachment_path)) {
                @unlink($attachment_path);
            }
        } catch (Throwable $mailErr) {
            @file_put_contents(__DIR__ . '/smtp_error.log', "[" . date('Y-m-d H:i:s') . "] Offline confirm email failed for $email: " . $mailErr->getMessage() . "\n", FILE_APPEND);
        }

        return array("success" => true, "upgraded" => true, "newId" => $new_id, "password" => $password);
    } else {
        // Just standard confirmation update
        $stmt_update = $conn->prepare("UPDATE registrations SET status = 'CONFIRMED' WHERE id = :id");
        $stmt_update->bindParam(':id', $id);
        $stmt_update->execute();
        
        return array("success" => true, "upgraded" => false, "newId" => $id, "password" => $record['password']);
    }
}



function send_smtp_email($to, $subject, $html_message, $host, $port, $user, $pass, $auth, $attachment_path = null, $attachment_name = '') {
    $has_attachment = (!empty($attachment_path) && file_exists($attachment_path));
    $boundary = $has_attachment ? md5(uniqid(microtime(), true)) : '';

    if (!$auth || empty($pass)) {
        $headers = "MIME-Version: 1.0" . "\r\n";
        if ($has_attachment) {
            $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
            $headers .= "From: 30th IAPHD NATCON 2026 <ambidexevents@gmail.com>\r\n";
            $headers .= "Reply-To: ambidexevents@gmail.com\r\n";

            $body = "--$boundary\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $html_message . "\r\n\r\n";

            $file_content = file_get_contents($attachment_path);
            $base64_file = chunk_split(base64_encode($file_content));

            $body .= "--$boundary\r\n";
            $body .= "Content-Type: application/octet-stream; name=\"$attachment_name\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"$attachment_name\"\r\n\r\n";
            $body .= $base64_file . "\r\n\r\n";
            $body .= "--$boundary--\r\n";

            return @mail($to, $subject, $body, $headers, "-fambidexevents@gmail.com");
        } else {
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: 30th IAPHD NATCON 2026 <ambidexevents@gmail.com>" . "\r\n";
            $headers .= "Reply-To: ambidexevents@gmail.com" . "\r\n";
            return @mail($to, $subject, $html_message, $headers, "-fambidexevents@gmail.com");
        }
    }

    try {
        $timeout = 3;
        $secure_prefix = ($port == 465) ? "ssl://" : "";
        $socket = @fsockopen($secure_prefix . $host, $port, $errno, $errstr, $timeout);
        
        if (!$socket) {
            throw new Exception("Could not connect to SMTP server $host:$port. Error: $errstr ($errno)");
        }
        
        stream_set_timeout($socket, 3);
        
        $read_response = function($sock, $expected) {
            $response = "";
            while (substr($response, 3, 1) != ' ') {
                $line = fgets($sock, 512);
                if ($line === false) break;
                $response .= $line;
            }
            $code = substr($response, 0, 3);
            if ($code != $expected) {
                throw new Exception("SMTP Error: Expected $expected, got $response");
            }
            return $response;
        };
        
        $read_response($socket, '220');
        
        fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? "localhost") . "\r\n");
        $read_response($socket, '250');
        
        if ($port == 587) {
            fwrite($socket, "STARTTLS\r\n");
            $read_response($socket, '220');
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? "localhost") . "\r\n");
            $read_response($socket, '250');
        }
        
        fwrite($socket, "AUTH LOGIN\r\n");
        $read_response($socket, '334');
        
        fwrite($socket, base64_encode($user) . "\r\n");
        $read_response($socket, '334');
        
        // Strip spaces from password before base64 encoding to be safe with Gmail App Passwords
        $clean_pass = str_replace(' ', '', $pass);
        fwrite($socket, base64_encode($clean_pass) . "\r\n");
        $read_response($socket, '235');
        
        fwrite($socket, "MAIL FROM:<$user>\r\n");
        $read_response($socket, '250');
        
        fwrite($socket, "RCPT TO:<$to>\r\n");
        $read_response($socket, '250');
        
        fwrite($socket, "DATA\r\n");
        $read_response($socket, '354');
        
        $headers = "MIME-Version: 1.0\r\n";
        if ($has_attachment) {
            $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        } else {
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        }
        $headers .= "From: 30th IAPHD NATCON 2026 <$user>\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "Date: " . date('r') . "\r\n";
        $headers .= "Message-ID: <" . md5(uniqid(microtime(), true)) . "@" . $host . ">\r\n";
        $headers .= "\r\n";
        
        if ($has_attachment) {
            $body = "--$boundary\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $html_message . "\r\n\r\n";

            $file_content = file_get_contents($attachment_path);
            $base64_file = chunk_split(base64_encode($file_content));

            $body .= "--$boundary\r\n";
            $body .= "Content-Type: application/octet-stream; name=\"$attachment_name\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"$attachment_name\"\r\n\r\n";
            $body .= $base64_file . "\r\n\r\n";
            $body .= "--$boundary--\r\n";
        } else {
            $body = preg_replace('/(?<!\r)\n/', "\r\n", $html_message);
            $body = str_replace("\r\n.", "\r\n..", $body);
        }
        
        fwrite($socket, $headers . $body . "\r\n.\r\n");
        $read_response($socket, '250');
        
        fwrite($socket, "QUIT\r\n");
        fclose($socket);
        return true;
    } catch (Throwable $e) {
        if (isset($socket) && $socket) {
            @fclose($socket);
        }
        // Log the SMTP failure details for debugging
        $log_message = "[" . date('Y-m-d H:i:s') . "] SMTP failed for $to: " . $e->getMessage() . "\n";
        @file_put_contents(__DIR__ . '/smtp_error.log', $log_message, FILE_APPEND);
        
        // Fall back to native PHP mail() to guarantee email is sent!
        $fallback_headers = "MIME-Version: 1.0" . "\r\n";
        if ($has_attachment) {
            $fallback_headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
            $fallback_headers .= "From: 30th IAPHD NATCON 2026 <ambidexevents@gmail.com>\r\n";
            $fallback_headers .= "Reply-To: registrations.30thiaphdnatcon@gmail.com\r\n";
            
            $body = "--$boundary\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $html_message . "\r\n\r\n";

            $file_content = file_get_contents($attachment_path);
            $base64_file = chunk_split(base64_encode($file_content));

            $body .= "--$boundary\r\n";
            $body .= "Content-Type: application/octet-stream; name=\"$attachment_name\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"$attachment_name\"\r\n\r\n";
            $body .= $base64_file . "\r\n\r\n";
            $body .= "--$boundary--\r\n";
            
            return @mail($to, $subject, $body, $fallback_headers, "-fambidexevents@gmail.com");
        } else {
            $fallback_headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $fallback_headers .= "From: IAPHD NATCON 2026 <ambidexevents@gmail.com>" . "\r\n";
            $fallback_headers .= "Reply-To: registrations.30thiaphdnatcon@gmail.com" . "\r\n";
            return @mail($to, $subject, $html_message, $fallback_headers, "-fambidexevents@gmail.com");
        }
    }
}

try {
    // First try connecting directly to the target database
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $tableExists = false;
    try {
        $result = $conn->query("SELECT 1 FROM registrations LIMIT 1");
        $tableExists = ($result !== false);
        
        if ($tableExists) {
            // Self-healing column migration: Ensure offline_online exists in registrations
            try {
                $colQuery = $conn->query("SHOW COLUMNS FROM registrations LIKE 'offline_online'");
                if ($colQuery !== false) {
                    $colCheck = $colQuery->fetch();
                    if (!$colCheck) {
                        $conn->exec("ALTER TABLE registrations ADD COLUMN offline_online VARCHAR(20) DEFAULT 'online'");
                    }
                }
            } catch (PDOException $col_err) {
                // Silently swallow column check error
            }

            // Self-healing column migration: Ensure profilePic exists and is LONGTEXT in registrations
            try {
                $colQuery = $conn->query("SHOW COLUMNS FROM registrations LIKE 'profilePic'");
                if ($colQuery !== false) {
                    $colCheck = $colQuery->fetch();
                    if (!$colCheck) {
                        $conn->exec("ALTER TABLE registrations ADD COLUMN profilePic LONGTEXT DEFAULT NULL");
                    } else {
                        $conn->exec("ALTER TABLE registrations MODIFY COLUMN profilePic LONGTEXT DEFAULT NULL");
                    }
                }
            } catch (PDOException $col_err) {
                // Silently swallow column check error
            }

            // Self-healing column migration: Ensure password exists in registrations
            try {
                $colQuery = $conn->query("SHOW COLUMNS FROM registrations LIKE 'password'");
                if ($colQuery !== false) {
                    $colCheck = $colQuery->fetch();
                    if (!$colCheck) {
                        $conn->exec("ALTER TABLE registrations ADD COLUMN password VARCHAR(255) DEFAULT NULL");
                    }
                }
            } catch (PDOException $col_err) {
                // Silently swallow column check error
            }

            // Self-healing migration: Ensure submissions table exists & has status column
            try {
                $conn->exec("CREATE TABLE IF NOT EXISTS submissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    regId VARCHAR(50) NOT NULL,
                    fullName VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    mobile VARCHAR(20) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    fileUrl TEXT NOT NULL,
                    fileName VARCHAR(255) DEFAULT NULL,
                    status VARCHAR(20) DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (regId) REFERENCES registrations(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

                // Ensure status column exists in case it was created without it
                $subColQuery = $conn->query("SHOW COLUMNS FROM submissions LIKE 'status'");
                if ($subColQuery !== false) {
                    $subColCheck = $subColQuery->fetch();
                    if (!$subColCheck) {
                        $conn->exec("ALTER TABLE submissions ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING'");
                    }
                }
            } catch (PDOException $sub_err) {
                // Silently swallow
            }
        }
    } catch (PDOException $e) {
        $tableExists = false;
    }

    if (!$tableExists) {
        // Create registrations table
        $conn->exec("CREATE TABLE IF NOT EXISTS registrations (
            id VARCHAR(50) PRIMARY KEY,
            fullName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            gender VARCHAR(20),
            institution VARCHAR(255),
            designation VARCHAR(100),
            councilRegNo VARCHAR(100),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(20),
            tier VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            iaphdNo VARCHAR(50),
            foodPreference VARCHAR(50),
            hasAccompanying VARCHAR(10),
            accompanyingName VARCHAR(255),
            accompanyingCount INT DEFAULT 0,
            accompanyingFood VARCHAR(50),
            transactionId VARCHAR(100),
            paymentDate DATE,
            amountPaid DECIMAL(10, 2),
            status VARCHAR(20) DEFAULT 'PENDING',
            offline_online VARCHAR(20) DEFAULT 'online',
            profilePic TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Create other tables
        $conn->exec("CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $conn->exec("CREATE TABLE IF NOT EXISTS settings (
            `key` VARCHAR(100) PRIMARY KEY,
            `value` LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $conn->exec("CREATE TABLE IF NOT EXISTS schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dayNumber INT NOT NULL,
            timeSlot VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            speaker VARCHAR(255) NOT NULL,
            venue VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $conn->exec("CREATE TABLE IF NOT EXISTS sponsors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logoUrl TEXT NOT NULL,
            tier VARCHAR(100) NOT NULL,
            orderIndex INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $conn->exec("CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            isActive BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $conn->exec("CREATE TABLE IF NOT EXISTS gallery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            mediaUrl TEXT NOT NULL,
            mediaType VARCHAR(50) DEFAULT 'image',
            category VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Seed default admin
        $adminQuery = $conn->query("SELECT id FROM admins WHERE username = 'admin'");
        $check_admin = $adminQuery !== false ? $adminQuery->fetch() : false;
        if (!$check_admin) {
            $conn->exec("INSERT INTO admins (username, password) VALUES ('admin', '$2b$10$qR6QdM8G.P8R07GZ5U/M1O0Q2R0K6J2y9L3jX.1n.UuY4P5C.4X4G')");
        }
    }
} catch(PDOException $exception) {
    // If running locally on XAMPP and the database doesn't exist, try to dynamically create it!
    if ($is_local && ($exception->getCode() == 1049 || strpos($exception->getMessage(), "Unknown database") !== false)) {
        try {
            // Connect to MySQL server without database context
            $conn = new PDO("mysql:host=" . $host . ";charset=utf8mb4", $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create the database
            $conn->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Reconnect with the database context
            $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Create registrations table
            $conn->exec("CREATE TABLE IF NOT EXISTS registrations (
                id VARCHAR(50) PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                gender VARCHAR(20),
                institution VARCHAR(255),
                designation VARCHAR(100),
                councilRegNo VARCHAR(100),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                tier VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL,
                iaphdNo VARCHAR(50),
                foodPreference VARCHAR(50),
                hasAccompanying VARCHAR(10),
                accompanyingName VARCHAR(255),
                accompanyingCount INT DEFAULT 0,
                accompanyingFood VARCHAR(50),
                transactionId VARCHAR(100),
                paymentDate DATE,
                amountPaid DECIMAL(10, 2),
                status VARCHAR(20) DEFAULT 'PENDING',
                offline_online VARCHAR(20) DEFAULT 'online',
                profilePic TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // Create other tables
            $conn->exec("CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS settings (
                `key` VARCHAR(100) PRIMARY KEY,
                `value` LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dayNumber INT NOT NULL,
                timeSlot VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                speaker VARCHAR(255) NOT NULL,
                venue VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS sponsors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                logoUrl TEXT NOT NULL,
                tier VARCHAR(100) NOT NULL,
                orderIndex INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                mediaUrl TEXT NOT NULL,
                mediaType VARCHAR(50) DEFAULT 'image',
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $conn->exec("CREATE TABLE IF NOT EXISTS submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                regId VARCHAR(50) NOT NULL,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                type VARCHAR(50) NOT NULL,
                category VARCHAR(100) NOT NULL,
                fileUrl TEXT NOT NULL,
                fileName VARCHAR(255) DEFAULT NULL,
                status VARCHAR(20) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (regId) REFERENCES registrations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // Seed default admin
            $adminQuery = $conn->query("SELECT id FROM admins WHERE username = 'admin'");
            $check_admin = $adminQuery !== false ? $adminQuery->fetch() : false;
            if (!$check_admin) {
                $conn->exec("INSERT INTO admins (username, password) VALUES ('admin', '$2b$10$qR6QdM8G.P8R07GZ5U/M1O0Q2R0K6J2y9L3jX.1n.UuY4P5C.4X4G')");
            }

        } catch(PDOException $e2) {
            echo json_encode(array("error" => "Self-healing database creation failed: " . $e2->getMessage()));
            exit();
        }
    } else {
        echo json_encode(array("error" => "Database connection failed: " . $exception->getMessage()));
        exit();
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'settings') {
        try {
            $stmt = $conn->prepare("SELECT * FROM settings");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $settings = array();
            foreach ($rows as $row) {
                $settings[$row['key']] = json_decode($row['value']);
            }
            echo json_encode($settings);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch settings: " . $e->getMessage()));
        }
        exit();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'schedules') {
        try {
            $stmt = $conn->prepare("SELECT * FROM schedules ORDER BY dayNumber ASC, timeSlot ASC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch schedules: " . $e->getMessage()));
        }
        exit();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'sponsors') {
        try {
            $stmt = $conn->prepare("SELECT * FROM sponsors ORDER BY orderIndex ASC, name ASC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch sponsors: " . $e->getMessage()));
        }
        exit();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'announcements') {
        try {
            $stmt = $conn->prepare("SELECT * FROM announcements ORDER BY created_at DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch announcements: " . $e->getMessage()));
        }
        exit();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'gallery') {
        try {
            $stmt = $conn->prepare("SELECT * FROM gallery ORDER BY created_at DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch gallery: " . $e->getMessage()));
        }
        exit();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'submissions') {
        try {
            $stmt = $conn->prepare("SELECT * FROM submissions ORDER BY created_at DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to fetch submissions: " . $e->getMessage()));
        }
        exit();
    }

    // Default GET: Fetch registrations
    try {
        $stmt = $conn->prepare("SELECT * FROM registrations ORDER BY created_at DESC");
        $stmt->execute();
        $registrations = $stmt->fetchAll();
        echo json_encode($registrations);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Failed to fetch registrations: " . $e->getMessage()));
    }
}

// ── 3. POST ACTIONS (REGISTRATION, AUTH, CMS SETTINGS) ───────────────────
if ($method === 'POST') {
    // Handle image file upload request if sent
    if (isset($_FILES['image'])) {
        try {
            $target_dir = __DIR__ . "/uploads/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }
            
            $file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
            $new_filename = uniqid("img_", true) . "." . $file_extension;
            $target_file = $target_dir . $new_filename;
            
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                // Dynamically build the absolute URL to the uploaded file
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
                $host = $_SERVER['HTTP_HOST'];
                $uri = $_SERVER['REQUEST_URI'];
                $dir_path = dirname($uri);
                if ($dir_path === '/' || $dir_path === '\\') {
                    $dir_path = '';
                }
                $base_url = $protocol . "://" . $host . $dir_path . "/uploads/" . $new_filename;
                
                echo json_encode(array("success" => true, "url" => $base_url));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to move uploaded file."));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Image upload failed: " . $e->getMessage()));
        }
        exit();
    }

    // Get JSON payload
    $raw_input = file_get_contents("php://input");
    @file_put_contents(__DIR__ . '/debug_api.log', "[" . date('Y-m-d H:i:s') . "] Raw Input: " . $raw_input . "\n", FILE_APPEND);
    $data = json_decode($raw_input);
    @file_put_contents(__DIR__ . '/debug_api.log', "[" . date('Y-m-d H:i:s') . "] Decoded Data: " . print_r($data, true) . "\n", FILE_APPEND);
    
    // Check if save dynamic setting request
    if (isset($data->action) && $data->action === 'save_setting') {
        if (!empty($data->key) && isset($data->value)) {
            try {
                $stmt = $conn->prepare("INSERT INTO settings (`key`, `value`) VALUES (:key, :value) ON DUPLICATE KEY UPDATE `value` = :value");
                
                $key = htmlspecialchars(strip_tags($data->key));
                $value = json_encode($data->value);
                
                $stmt->bindParam(':key', $key);
                $stmt->bindParam(':value', $value);
                $stmt->execute();
                
                echo json_encode(array("success" => true, "message" => "Setting '{$key}' updated successfully."));
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to save setting: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete key or value."));
        }
        exit();
    }

    // Delete schedule action
    if (isset($data->action) && $data->action === 'delete_schedule') {
        try {
            $stmt = $conn->prepare("DELETE FROM schedules WHERE id = :id");
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete schedule: " . $e->getMessage()));
        }
        exit();
    }

    // Delete sponsor action
    if (isset($data->action) && $data->action === 'delete_sponsor') {
        try {
            $stmt = $conn->prepare("DELETE FROM sponsors WHERE id = :id");
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete sponsor: " . $e->getMessage()));
        }
        exit();
    }

    // Delete announcement action
    if (isset($data->action) && $data->action === 'delete_announcement') {
        try {
            $stmt = $conn->prepare("DELETE FROM announcements WHERE id = :id");
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete announcement: " . $e->getMessage()));
        }
        exit();
    }

    // Delete gallery item action
    if (isset($data->action) && $data->action === 'delete_gallery') {
        try {
            $stmt = $conn->prepare("DELETE FROM gallery WHERE id = :id");
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete gallery item: " . $e->getMessage()));
        }
        exit();
    }

    // Save submission action
    if (isset($data->action) && $data->action === 'save_submission') {
        if (!empty($data->regId) && !empty($data->type) && !empty($data->category) && !empty($data->fileUrl)) {
            try {
                // Fetch delegate name, email, mobile from registrations
                $stmt_reg = $conn->prepare("SELECT fullName, email, mobile FROM registrations WHERE id = :regId LIMIT 1");
                $stmt_reg->bindParam(':regId', $data->regId);
                $stmt_reg->execute();
                $delegate = $stmt_reg->fetch(PDO::FETCH_ASSOC);

                if (!$delegate) {
                    http_response_code(400);
                    echo json_encode(array("error" => "Registration ID not found."));
                    exit();
                }

                $stmt = $conn->prepare("INSERT INTO submissions (regId, fullName, email, mobile, type, category, fileUrl, fileName) VALUES (:regId, :fullName, :email, :mobile, :type, :category, :fileUrl, :fileName)");
                
                $regId = htmlspecialchars(strip_tags($data->regId));
                $fullName = $delegate['fullName'];
                $email = $delegate['email'];
                $mobile = $delegate['mobile'];
                $type = htmlspecialchars(strip_tags($data->type));
                $category = htmlspecialchars(strip_tags($data->category));
                $fileUrl = htmlspecialchars(strip_tags($data->fileUrl));
                $fileName = !empty($data->fileName) ? htmlspecialchars(strip_tags($data->fileName)) : null;

                $stmt->bindParam(':regId', $regId);
                $stmt->bindParam(':fullName', $fullName);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':mobile', $mobile);
                $stmt->bindParam(':type', $type);
                $stmt->bindParam(':category', $category);
                $stmt->bindParam(':fileUrl', $fileUrl);
                $stmt->bindParam(':fileName', $fileName);
                $stmt->execute();
                $submission_id = $conn->lastInsertId();

                // Send confirmation email to delegate for abstract submission
                try {
                    $to = $email;
                    $subject = "Abstract / Presentation Submission Received - 30th IAPHD NATCON 2026 (Sub ID: $submission_id)";
                    
                    $message = "
                    <html>
                    <head>
                        <title>30th IAPHD NATCON 2026 Submission Receipt</title>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; color: #333333; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
                            .header { background-color: #002147; padding: 30px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #00A8CC; }
                            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                            .header p { margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #a0aec0; text-transform: uppercase; }
                            .content { padding: 40px 30px; }
                            .greeting { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 20px; }
                            .badge { display: inline-block; background-color: #00A8CC; color: #ffffff; font-weight: 800; padding: 8px 16px; border-radius: 4px; font-size: 13px; letter-spacing: 1px; margin-bottom: 25px; }
                            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            .details-table th, .details-table td { padding: 12px 15px; border-bottom: 1px solid #edf2f7; text-align: left; }
                            .details-table th { background-color: #f7fafc; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #718096; }
                            .details-table td { font-size: 13px; font-weight: 600; }
                            .details-table .label { color: #718096; font-size: 11px; text-transform: uppercase; font-weight: 700; }
                            .details-table .value { color: #2d3748; }
                            .footer { background-color: #f7fafc; padding: 35px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #718096; line-height: 1.6; }
                            .footer a { color: #00A8CC; text-decoration: none; font-weight: 700; }
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>30th IAPHD NATCON 2026</h1>
                                <p>Scientific Committee - Submission Confirmation</p>
                            </div>
                            <div class='content'>
                                <div class='greeting'>Dear $fullName,</div>
                                <p style='font-size: 14px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;'>
                                    We have successfully received your scientific entry for the 30th IAPHD National Conference (NATCON 2026) in Visakhapatnam. The details of your submission are outlined below.
                                </p>
                                
                                <div style='text-align: center;'>
                                    <div class='badge'>SUBMISSION ID: SUB-$submission_id</div>
                                </div>
                                
                                <table class='details-table'>
                                    <thead>
                                        <tr>
                                            <th colspan='2'>Submission Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class='label' style='width: 40%;'>Registration ID</td>
                                            <td class='value'>$regId</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Author Name</td>
                                            <td class='value'>$fullName</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Entry Type</td>
                                            <td class='value'>" . ucfirst($type) . "</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Category</td>
                                            <td class='value'>$category</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Uploaded File</td>
                                            <td class='value'><a href='$fileUrl' target='_blank' style='color:#00A8CC; font-weight:700;'>$fileName</a></td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Review Status</td>
                                            <td class='value'><span style='display:inline-block; background-color:#fffbeb; color:#b45309; border:1px solid #fef3c7; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:800;'>PENDING REVIEW</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <p style='font-size: 12px; line-height: 1.6; color: #718096;'>
                                    Our scientific panel is reviewing the submissions. You will be notified of acceptance or guidelines once the evaluations are completed.
                                </p>
                            </div>
                            <div class='footer'>
                                <strong>30th IAPHD NATCON 2026 Visakhapatnam</strong><br>
                                Department of Public Health Dentistry, ANIDS<br>
                                <a href='https://iaphdnatcon2026.com/'>iaphdnatcon2026.com</a>
                            </div>
                        </div>
                    </body>
                    </html>";
                    
                    send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                    
                    // Also send admin notification email
                    $admin_email = "ungatisrinu@gmail.com";
                    $admin_subject = "New Submission - SUB-$submission_id ($fullName)";
                    $admin_message = "
                    <html>
                    <body>
                        <h2>New Scientific Submission Received</h2>
                        <p><strong>Sub ID:</strong> SUB-$submission_id</p>
                        <p><strong>Reg ID:</strong> $regId</p>
                        <p><strong>Name:</strong> $fullName</p>
                        <p><strong>Email:</strong> $email</p>
                        <p><strong>Type:</strong> $type</p>
                        <p><strong>Category:</strong> $category</p>
                        <p><strong>File Name:</strong> $fileName</p>
                        <p><strong>File URL:</strong> <a href='$fileUrl'>$fileUrl</a></p>
                    </body>
                    </html>";
                    send_smtp_email($admin_email, $admin_subject, $admin_message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                } catch (Throwable $mailErr) {
                    @file_put_contents(__DIR__ . '/smtp_error.log', "[" . date('Y-m-d H:i:s') . "] Submission Mail failed: " . $mailErr->getMessage() . "\n", FILE_APPEND);
                }

                echo json_encode(array("success" => true, "id" => $submission_id));
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to save submission: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete submission data."));
        }
        exit();
    }

    // Delete submission action
    if (isset($data->action) && $data->action === 'delete_submission') {
        try {
            $stmt = $conn->prepare("DELETE FROM submissions WHERE id = :id");
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete submission: " . $e->getMessage()));
        }
        exit();
    }

    // Update submission status action
    if (isset($data->action) && $data->action === 'update_submission_status') {
        if (!empty($data->id) && !empty($data->status)) {
            try {
                $id = intval($data->id);
                $status = htmlspecialchars(strip_tags($data->status));

                // Fetch submission details first
                $stmt_select = $conn->prepare("SELECT * FROM submissions WHERE id = :id LIMIT 1");
                $stmt_select->bindParam(':id', $id);
                $stmt_select->execute();
                $submission = $stmt_select->fetch(PDO::FETCH_ASSOC);

                if (!$submission) {
                    http_response_code(404);
                    echo json_encode(array("error" => "Submission entry not found."));
                    exit();
                }

                // Update status
                $stmt = $conn->prepare("UPDATE submissions SET status = :status WHERE id = :id");
                $stmt->bindParam(':status', $status);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();

                // Send status update email to the author
                try {
                    $to = $submission['email'];
                    $fullName = $submission['fullName'];
                    $submission_id = $submission['id'];
                    $regId = $submission['regId'];
                    $type = $submission['type'];
                    $category = $submission['category'];
                    $fileUrl = $submission['fileUrl'];
                    $fileName = $submission['fileName'];

                    $subject = "Scientific Entry Status Update: " . strtoupper($status) . " - 30th IAPHD NATCON 2026 (Sub ID: $submission_id)";
                    
                    $statusColor = $status === 'APPROVED' ? '#059669' : ($status === 'REJECTED' ? '#dc2626' : '#b45309');
                    $statusBg = $status === 'APPROVED' ? '#ecfdf5' : ($status === 'REJECTED' ? '#fef2f2' : '#fffbeb');
                    $statusBorder = $status === 'APPROVED' ? '#a7f3d0' : ($status === 'REJECTED' ? '#fecaca' : '#fef3c7');

                    $message = "
                    <html>
                    <head>
                        <title>30th IAPHD NATCON 2026 Submission Status Update</title>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; color: #333333; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
                            .header { background-color: #002147; padding: 30px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #00A8CC; }
                            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                            .header p { margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #a0aec0; text-transform: uppercase; }
                            .content { padding: 40px 30px; }
                            .greeting { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 20px; }
                            .badge { display: inline-block; background-color: #00A8CC; color: #ffffff; font-weight: 800; padding: 8px 16px; border-radius: 4px; font-size: 13px; letter-spacing: 1px; margin-bottom: 25px; }
                            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            .details-table th, .details-table td { padding: 12px 15px; border-bottom: 1px solid #edf2f7; text-align: left; }
                            .details-table th { background-color: #f7fafc; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #718096; }
                            .details-table td { font-size: 13px; font-weight: 600; }
                            .details-table .label { color: #718096; font-size: 11px; text-transform: uppercase; font-weight: 700; }
                            .details-table .value { color: #2d3748; }
                            .status-badge { display: inline-block; background-color: $statusBg; color: $statusColor; border: 1px solid $statusBorder; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
                            .footer { background-color: #f7fafc; padding: 35px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #718096; line-height: 1.6; }
                            .footer a { color: #00A8CC; text-decoration: none; font-weight: 700; }
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>30th IAPHD NATCON 2026</h1>
                                <p>Scientific Committee - Status Notification</p>
                            </div>
                            <div class='content'>
                                <div class='greeting'>Dear Dr. $fullName,</div>
                                <p style='font-size: 14px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;'>
                                    The Scientific Committee has reviewed your entry for the 30th IAPHD National Conference (NATCON 2026). The status of your submission has been updated as shown below.
                                </p>
                                
                                <div style='text-align: center;'>
                                    <div class='badge'>SUBMISSION ID: SUB-$submission_id</div>
                                </div>
                                
                                <table class='details-table'>
                                    <thead>
                                        <tr>
                                            <th colspan='2'>Submission Status Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class='label' style='width: 40%;'>Registration ID</td>
                                            <td class='value'>$regId</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Author Name</td>
                                            <td class='value'>$fullName</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Entry Type</td>
                                            <td class='value'>" . ucfirst($type) . "</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Category</td>
                                            <td class='value'>$category</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Uploaded File</td>
                                            <td class='value'><a href='$fileUrl' target='_blank' style='color:#00A8CC; font-weight:700;'>$fileName</a></td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Review Status</td>
                                            <td class='value'><span class='status-badge'>" . strtoupper($status) . "</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <p style='font-size: 13px; line-height: 1.6; color: #2d3748;'>
                                    " . ($status === 'APPROVED' 
                                        ? "Congratulations! Your submission has been approved by the scientific panel. Please make sure to prepare your presentation according to the official guidelines." 
                                        : ($status === 'REJECTED' 
                                            ? "We regret to inform you that your scientific entry was not approved for this conference. Thank you for your interest and effort." 
                                            : "Your scientific entry is currently under review by the panel. We will notify you once evaluation has concluded.")) . "
                                </p>
                            </div>
                            <div class='footer'>
                                <strong>30th IAPHD NATCON 2026 Visakhapatnam</strong><br>
                                Department of Public Health Dentistry, ANIDS<br>
                                <a href='https://iaphdnatcon2026.com/'>iaphdnatcon2026.com</a>
                            </div>
                        </div>
                    </body>
                    </html>";
                    
                    send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                } catch (Throwable $mailErr) {
                    @file_put_contents(__DIR__ . '/smtp_error.log', "[" . date('Y-m-d H:i:s') . "] Status Mail failed: " . $mailErr->getMessage() . "\n", FILE_APPEND);
                }

                echo json_encode(array("success" => true));
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to update status: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete parameters."));
        }
        exit();
    }

    // Update schedule action
    if (isset($data->action) && $data->action === 'update_schedule') {
        try {
            $stmt = $conn->prepare("UPDATE schedules SET dayNumber = :dayNumber, timeSlot = :timeSlot, title = :title, speaker = :speaker, venue = :venue WHERE id = :id");
            $stmt->bindParam(':dayNumber', $data->dayNumber, PDO::PARAM_INT);
            $stmt->bindParam(':timeSlot', htmlspecialchars(strip_tags($data->timeSlot)));
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':speaker', htmlspecialchars(strip_tags($data->speaker)));
            $stmt->bindParam(':venue', htmlspecialchars(strip_tags($data->venue)));
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update schedule: " . $e->getMessage()));
        }
        exit();
    }

    // Update sponsor action
    if (isset($data->action) && $data->action === 'update_sponsor') {
        try {
            $stmt = $conn->prepare("UPDATE sponsors SET name = :name, logoUrl = :logoUrl, tier = :tier, orderIndex = :orderIndex WHERE id = :id");
            $stmt->bindParam(':name', htmlspecialchars(strip_tags($data->name)));
            $stmt->bindParam(':logoUrl', htmlspecialchars(strip_tags($data->logoUrl)));
            $stmt->bindParam(':tier', htmlspecialchars(strip_tags($data->tier)));
            $stmt->bindParam(':orderIndex', $data->orderIndex, PDO::PARAM_INT);
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update sponsor: " . $e->getMessage()));
        }
        exit();
    }

    // Update announcement action
    if (isset($data->action) && $data->action === 'update_announcement') {
        try {
            $stmt = $conn->prepare("UPDATE announcements SET title = :title, content = :content, isActive = :isActive WHERE id = :id");
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':content', htmlspecialchars(strip_tags($data->content)));
            $stmt->bindParam(':isActive', $data->isActive, PDO::PARAM_BOOL);
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update announcement: " . $e->getMessage()));
        }
        exit();
    }

    // Update gallery item action
    if (isset($data->action) && $data->action === 'update_gallery') {
        try {
            $stmt = $conn->prepare("UPDATE gallery SET title = :title, mediaUrl = :mediaUrl, mediaType = :mediaType, category = :category WHERE id = :id");
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':mediaUrl', htmlspecialchars(strip_tags($data->mediaUrl)));
            $stmt->bindParam(':mediaType', htmlspecialchars(strip_tags($data->mediaType)));
            $stmt->bindParam(':category', htmlspecialchars(strip_tags($data->category)));
            $stmt->bindParam(':id', $data->id, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update gallery item: " . $e->getMessage()));
        }
        exit();
    }

    // Approve delegate registration action
    if (isset($data->action) && $data->action === 'approve_registration') {
        try {
            $res = confirm_offline_registration_if_needed($conn, $data->id, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
            if ($res['success']) {
                echo json_encode($res);
            } else {
                http_response_code(400);
                echo json_encode(array("error" => $res['error']));
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to approve registration: " . $e->getMessage()));
        }
        exit();
    }

    // Update registration action
    if (isset($data->action) && $data->action === 'update_registration') {
        if (!empty($data->id)) {
            try {
                // First fetch the existing record to prevent overwriting with empty fields on partial updates
                $stmt_fetch = $conn->prepare("SELECT * FROM registrations WHERE id = :id LIMIT 1");
                $stmt_fetch->bindParam(':id', $data->id);
                $stmt_fetch->execute();
                $existing = $stmt_fetch->fetch(PDO::FETCH_ASSOC);

                if (!$existing) {
                    http_response_code(404);
                    echo json_encode(array("error" => "Registration record not found."));
                    exit();
                }

                $stmt = $conn->prepare("UPDATE registrations SET 
                    fullName = :fullName, 
                    email = :email, 
                    mobile = :mobile, 
                    gender = :gender, 
                    institution = :institution, 
                    designation = :designation, 
                    councilRegNo = :councilRegNo, 
                    address = :address, 
                    city = :city, 
                    state = :state, 
                    pincode = :pincode, 
                    tier = :tier, 
                    category = :category, 
                    iaphdNo = :iaphdNo, 
                    foodPreference = :foodPreference, 
                    hasAccompanying = :hasAccompanying, 
                    accompanyingName = :accompanyingName, 
                    accompanyingCount = :accompanyingCount, 
                    accompanyingFood = :accompanyingFood, 
                    transactionId = :transactionId, 
                    paymentDate = :paymentDate, 
                    amountPaid = :amountPaid, 
                    status = :status,
                    offline_online = :offline_online,
                    profilePic = :profilePic,
                    paymentScreenshot = :paymentScreenshot
                    WHERE id = :id");
                
                $fullName = isset($data->fullName) ? htmlspecialchars(strip_tags($data->fullName)) : $existing['fullName'];
                $email = isset($data->email) ? htmlspecialchars(strip_tags($data->email)) : $existing['email'];
                $mobile = isset($data->mobile) ? htmlspecialchars(strip_tags($data->mobile)) : $existing['mobile'];
                $gender = isset($data->gender) ? htmlspecialchars(strip_tags($data->gender)) : $existing['gender'];
                $institution = isset($data->institution) ? htmlspecialchars(strip_tags($data->institution)) : $existing['institution'];
                $designation = isset($data->designation) ? htmlspecialchars(strip_tags($data->designation)) : $existing['designation'];
                $councilRegNo = isset($data->councilRegNo) ? htmlspecialchars(strip_tags($data->councilRegNo)) : $existing['councilRegNo'];
                $address = isset($data->address) ? htmlspecialchars(strip_tags($data->address)) : $existing['address'];
                $city = isset($data->city) ? htmlspecialchars(strip_tags($data->city)) : $existing['city'];
                $state = isset($data->state) ? htmlspecialchars(strip_tags($data->state)) : $existing['state'];
                $pincode = isset($data->pincode) ? htmlspecialchars(strip_tags($data->pincode)) : $existing['pincode'];
                $tier = isset($data->tier) ? htmlspecialchars(strip_tags($data->tier)) : $existing['tier'];
                $category = isset($data->category) ? htmlspecialchars(strip_tags($data->category)) : $existing['category'];
                $iaphdNo = isset($data->iaphdNo) ? htmlspecialchars(strip_tags($data->iaphdNo)) : $existing['iaphdNo'];
                $foodPreference = isset($data->foodPreference) ? htmlspecialchars(strip_tags($data->foodPreference)) : $existing['foodPreference'];
                $hasAccompanying = isset($data->hasAccompanying) ? htmlspecialchars(strip_tags($data->hasAccompanying)) : $existing['hasAccompanying'];
                $accompanyingName = isset($data->accompanyingName) ? htmlspecialchars(strip_tags($data->accompanyingName)) : $existing['accompanyingName'];
                $accompanyingCount = isset($data->accompanyingCount) ? intval($data->accompanyingCount) : $existing['accompanyingCount'];
                $accompanyingFood = isset($data->accompanyingFood) ? htmlspecialchars(strip_tags($data->accompanyingFood)) : $existing['accompanyingFood'];
                $transactionId = isset($data->transactionId) ? htmlspecialchars(strip_tags($data->transactionId)) : $existing['transactionId'];
                $paymentDate = isset($data->paymentDate) ? htmlspecialchars(strip_tags($data->paymentDate)) : $existing['paymentDate'];
                $amountPaid = isset($data->amountPaid) ? floatval($data->amountPaid) : floatval($existing['amountPaid']);
                $status = isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : $existing['status'];
                $offline_online = isset($data->offline_online) ? htmlspecialchars(strip_tags($data->offline_online)) : $existing['offline_online'];
                $profilePic = isset($data->profilePic) ? $data->profilePic : $existing['profilePic'];
                $paymentScreenshot = isset($data->paymentScreenshot) ? $data->paymentScreenshot : $existing['paymentScreenshot'];
                
                $stmt->bindParam(':id', $data->id);
                $stmt->bindParam(':fullName', $fullName);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':mobile', $mobile);
                $stmt->bindParam(':gender', $gender);
                $stmt->bindParam(':institution', $institution);
                $stmt->bindParam(':designation', $designation);
                $stmt->bindParam(':councilRegNo', $councilRegNo);
                $stmt->bindParam(':address', $address);
                $stmt->bindParam(':city', $city);
                $stmt->bindParam(':state', $state);
                $stmt->bindParam(':pincode', $pincode);
                $stmt->bindParam(':tier', $tier);
                $stmt->bindParam(':category', $category);
                $stmt->bindParam(':iaphdNo', $iaphdNo);
                $stmt->bindParam(':foodPreference', $foodPreference);
                $stmt->bindParam(':hasAccompanying', $hasAccompanying);
                $stmt->bindParam(':accompanyingName', $accompanyingName);
                $stmt->bindParam(':accompanyingCount', $accompanyingCount, PDO::PARAM_INT);
                $stmt->bindParam(':accompanyingFood', $accompanyingFood);
                $stmt->bindParam(':transactionId', $transactionId);
                $stmt->bindParam(':paymentDate', $paymentDate);
                $stmt->bindParam(':amountPaid', $amountPaid);
                $stmt->bindParam(':status', $status);
                $stmt->bindParam(':offline_online', $offline_online);
                $stmt->bindParam(':profilePic', $profilePic);
                $stmt->bindParam(':paymentScreenshot', $paymentScreenshot);
                
                $stmt->execute();

                $new_id = $data->id;
                $generated_password = null;
                $upgraded = false;
                
                // Upgrade ID to NATCON final ID if confirmed and not already upgraded
                if ($status === 'CONFIRMED' && strpos($data->id, 'NATCON-') !== 0) {
                    $res = confirm_offline_registration_if_needed($conn, $data->id, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                    if ($res['success'] && $res['upgraded']) {
                        $new_id = $res['newId'];
                        $generated_password = $res['password'];
                        $upgraded = true;
                    }
                }
                echo json_encode(array("success" => true, "message" => "Registration updated successfully.", "newId" => $new_id, "password" => $generated_password, "upgraded" => $upgraded));
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Failed to update registration: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Registration ID is required."));
        }
        exit();
    }

    // Resend confirmation email action
    if (isset($data->action) && $data->action === 'resend_email') {
        if (!empty($data->id)) {
            try {
                $stmt = $conn->prepare("SELECT * FROM registrations WHERE id = :id LIMIT 1");
                $stmt->bindParam(':id', $data->id);
                $stmt->execute();
                $record = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($record) {
                    $fullName = $record['fullName'];
                    $email = $record['email'];
                    $mobile = $record['mobile'];
                    $city = $record['city'];
                    $category = $record['category'];
                    $tier = $record['tier'];
                    $transactionId = $record['transactionId'];
                    $amountPaid = $record['amountPaid'];
                    $status = $record['status'];
                    $generated_id = $record['id'];
                    
                    $to = $email;
                    $subject = "30th IAPHD NATCON 2026 Registration Confirmation [Resent]";
                    $message = generate_confirmation_email_html($fullName, $generated_id, $category, $conn);
                    
                    $attachment_path = generate_receipt_image($record);
                    $attachment_name = "E-Receipt_" . $generated_id . ".png";
                    
                    send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth, $attachment_path, $attachment_name);
                    
                    if ($attachment_path && file_exists($attachment_path)) {
                        @unlink($attachment_path);
                    }
                    
                    echo json_encode(array("success" => true, "message" => "Confirmation email resent successfully!"));
                } else {
                    http_response_code(404);
                    echo json_encode(array("error" => "Registration record not found."));
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database error resending email: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Registration ID is required."));
        }
        exit();
    }

    // Resend submission confirmation email action
    if (isset($data->action) && $data->action === 'resend_submission_email') {
        if (!empty($data->id)) {
            try {
                $id = intval($data->id);
                $stmt = $conn->prepare("SELECT * FROM submissions WHERE id = :id LIMIT 1");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $submission = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($submission) {
                    $to = $submission['email'];
                    $fullName = $submission['fullName'];
                    $submission_id = $submission['id'];
                    $regId = $submission['regId'];
                    $type = $submission['type'];
                    $category = $submission['category'];
                    $fileUrl = $submission['fileUrl'];
                    $fileName = $submission['fileName'];

                    $subject = "Abstract / Presentation Submission Received - 30th IAPHD NATCON 2026 (Sub ID: $submission_id) [Resent]";
                    
                    $message = "
                    <html>
                    <head>
                        <title>30th IAPHD NATCON 2026 Submission Receipt</title>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; color: #333333; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
                            .header { background-color: #002147; padding: 30px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #00A8CC; }
                            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                            .header p { margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #a0aec0; text-transform: uppercase; }
                            .content { padding: 40px 30px; }
                            .greeting { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 20px; }
                            .badge { display: inline-block; background-color: #00A8CC; color: #ffffff; font-weight: 800; padding: 8px 16px; border-radius: 4px; font-size: 13px; letter-spacing: 1px; margin-bottom: 25px; }
                            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            .details-table th, .details-table td { padding: 12px 15px; border-bottom: 1px solid #edf2f7; text-align: left; }
                            .details-table th { background-color: #f7fafc; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #718096; }
                            .details-table td { font-size: 13px; font-weight: 600; }
                            .details-table .label { color: #718096; font-size: 11px; text-transform: uppercase; font-weight: 700; }
                            .details-table .value { color: #2d3748; }
                            .footer { background-color: #f7fafc; padding: 35px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #718096; line-height: 1.6; }
                            .footer a { color: #00A8CC; text-decoration: none; font-weight: 700; }
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>30th IAPHD NATCON 2026</h1>
                                <p>Scientific Committee - Submission Confirmation</p>
                            </div>
                            <div class='content'>
                                <div class='greeting'>Dear $fullName,</div>
                                <p style='font-size: 14px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;'>
                                    We have successfully received your scientific entry for the 30th IAPHD National Conference (NATCON 2026) in Visakhapatnam. The details of your submission are outlined below.
                                </p>
                                
                                <div style='text-align: center;'>
                                    <div class='badge'>SUBMISSION ID: SUB-$submission_id</div>
                                </div>
                                
                                <table class='details-table'>
                                    <thead>
                                        <tr>
                                            <th colspan='2'>Submission Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class='label' style='width: 40%;'>Registration ID</td>
                                            <td class='value'>$regId</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Author Name</td>
                                            <td class='value'>$fullName</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Entry Type</td>
                                            <td class='value'>" . ucfirst($type) . "</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Category</td>
                                            <td class='value'>$category</td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Uploaded File</td>
                                            <td class='value'><a href='$fileUrl' target='_blank' style='color:#00A8CC; font-weight:700;'>$fileName</a></td>
                                        </tr>
                                        <tr>
                                            <td class='label'>Review Status</td>
                                            <td class='value'><span style='display:inline-block; background-color:#fffbeb; color:#b45309; border:1px solid #fef3c7; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:800;'>" . strtoupper($submission['status']) . "</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <p style='font-size: 12px; line-height: 1.6; color: #718096;'>
                                    Our scientific panel is reviewing the submissions. You will be notified of acceptance or guidelines once the evaluations are completed.
                                </p>
                            </div>
                            <div class='footer'>
                                <strong>30th IAPHD NATCON 2026 Visakhapatnam</strong><br>
                                Department of Public Health Dentistry, ANIDS<br>
                                <a href='https://iaphdnatcon2026.com/'>iaphdnatcon2026.com</a>
                            </div>
                        </div>
                    </body>
                    </html>";
                    
                    send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                    echo json_encode(array("success" => true, "message" => "Submission email resent successfully."));
                } else {
                    http_response_code(404);
                    echo json_encode(array("error" => "Submission record not found."));
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database error resending submission email: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Submission ID is required."));
        }
        exit();
    }

    // Save schedule action
    if (isset($data->action) && $data->action === 'save_schedule') {
        try {
            $stmt = $conn->prepare("INSERT INTO schedules (dayNumber, timeSlot, title, speaker, venue) VALUES (:dayNumber, :timeSlot, :title, :speaker, :venue)");
            $stmt->bindParam(':dayNumber', $data->dayNumber, PDO::PARAM_INT);
            $stmt->bindParam(':timeSlot', htmlspecialchars(strip_tags($data->timeSlot)));
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':speaker', htmlspecialchars(strip_tags($data->speaker)));
            $stmt->bindParam(':venue', htmlspecialchars(strip_tags($data->venue)));
            $stmt->execute();
            echo json_encode(array("success" => true, "id" => $conn->lastInsertId()));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to save schedule: " . $e->getMessage()));
        }
        exit();
    }

    // Save sponsor action
    if (isset($data->action) && $data->action === 'save_sponsor') {
        try {
            $stmt = $conn->prepare("INSERT INTO sponsors (name, logoUrl, tier, orderIndex) VALUES (:name, :logoUrl, :tier, :orderIndex)");
            $stmt->bindParam(':name', htmlspecialchars(strip_tags($data->name)));
            $stmt->bindParam(':logoUrl', htmlspecialchars(strip_tags($data->logoUrl)));
            $stmt->bindParam(':tier', htmlspecialchars(strip_tags($data->tier)));
            $stmt->bindParam(':orderIndex', $data->orderIndex, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(array("success" => true, "id" => $conn->lastInsertId()));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to save sponsor: " . $e->getMessage()));
        }
        exit();
    }

    // Save announcement action
    if (isset($data->action) && $data->action === 'save_announcement') {
        try {
            $stmt = $conn->prepare("INSERT INTO announcements (title, content, isActive) VALUES (:title, :content, :isActive)");
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':content', htmlspecialchars(strip_tags($data->content)));
            $stmt->bindParam(':isActive', $data->isActive, PDO::PARAM_BOOL);
            $stmt->execute();
            echo json_encode(array("success" => true, "id" => $conn->lastInsertId()));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to save announcement: " . $e->getMessage()));
        }
        exit();
    }

    // Save gallery item action
    if (isset($data->action) && $data->action === 'save_gallery') {
        try {
            $stmt = $conn->prepare("INSERT INTO gallery (title, mediaUrl, mediaType, category) VALUES (:title, :mediaUrl, :mediaType, :category)");
            $stmt->bindParam(':title', htmlspecialchars(strip_tags($data->title)));
            $stmt->bindParam(':mediaUrl', htmlspecialchars(strip_tags($data->mediaUrl)));
            $stmt->bindParam(':mediaType', htmlspecialchars(strip_tags($data->mediaType)));
            $stmt->bindParam(':category', htmlspecialchars(strip_tags($data->category)));
            $stmt->execute();
            echo json_encode(array("success" => true, "id" => $conn->lastInsertId()));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to save gallery item: " . $e->getMessage()));
        }
        exit();
    }

    // Check duplicate action
    if (isset($data->action) && $data->action === 'check_duplicate') {
        if (!empty($data->email) && !empty($data->mobile)) {
            try {
                $email = strtolower(trim(htmlspecialchars(strip_tags($data->email))));
                $mobile = preg_replace('/\D/', '', htmlspecialchars(strip_tags($data->mobile)));

                $stmt_check = $conn->prepare("SELECT email, mobile FROM registrations WHERE (TRIM(LOWER(email)) = :email OR REPLACE(mobile, ' ', '') = :mobile) AND status != 'FAILED' LIMIT 1");
                $stmt_check->bindParam(':email', $email);
                $stmt_check->bindParam(':mobile', $mobile);
                $stmt_check->execute();
                $existing = $stmt_check->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    echo json_encode(array(
                        "exists" => true,
                        "error" => "You are already registered. Duplicate registrations are not accepted."
                    ));
                } else {
                    echo json_encode(array("exists" => false));
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database check failed: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete details for duplicate check."));
        }
        exit();
    }

    // Get single registration by email or phone
    if (isset($data->action) && $data->action === 'get_registration') {
        if (!empty($data->value) && !empty($data->type)) {
            try {
                $type = htmlspecialchars(strip_tags($data->type));
                
                if ($type === 'email') {
                    $value = strtolower(trim(htmlspecialchars(strip_tags($data->value))));
                    $stmt = $conn->prepare("SELECT * FROM registrations WHERE TRIM(LOWER(email)) = :value LIMIT 1");
                    $stmt->bindParam(':value', $value);
                } elseif ($type === 'id') {
                    $value = strtoupper(trim(htmlspecialchars(strip_tags($data->value))));
                    $stmt = $conn->prepare("SELECT * FROM registrations WHERE TRIM(UPPER(id)) = :value LIMIT 1");
                    $stmt->bindParam(':value', $value);
                } else {
                    $clean_value = preg_replace('/\D/', '', htmlspecialchars(strip_tags($data->value)));
                    $stmt = $conn->prepare("SELECT * FROM registrations WHERE mobile = :value OR REPLACE(mobile, ' ', '') = :value OR REPLACE(REPLACE(mobile, ' ', ''), '-', '') = :value LIMIT 1");
                    $stmt->bindParam(':value', $clean_value);
                }
                
                $stmt->execute();
                $record = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($record) {
                    echo json_encode(array("success" => true, "record" => $record));
                } else {
                    echo json_encode(array("success" => false, "error" => "No registration found matching the entered " . $type . "."));
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database query failed: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete details for registration query."));
        }
        exit();
    }

    // Check if login request or registration request
    if (isset($data->action) && $data->action === 'login') {
        // Admin credentials login
        $username_input = !empty($data->username) ? htmlspecialchars(strip_tags($data->username)) : '';
        $password_input = !empty($data->password) ? $data->password : '';
        
        if ($username_input === 'sadmin' && $password_input === 'ambi@1225') {
            echo json_encode(array("success" => true, "token" => "mock_php_jwt_token_for_dashboard", "username" => "sadmin"));
        } else if (($username_input === 'admin' || empty($username_input)) && ($password_input === 'admin123' || $password_input === 'admin')) {
            echo json_encode(array("success" => true, "token" => "mock_php_jwt_token_for_dashboard", "username" => "admin"));
        } else {
            http_response_code(401);
            echo json_encode(array("error" => "Invalid administrator credentials."));
        }
        exit();
    }

    // Delegate Login Action
    if (isset($data->action) && $data->action === 'delegate_login') {
        if (!empty($data->value) && !empty($data->password)) {
            try {
                $value = trim(htmlspecialchars(strip_tags($data->value)));
                $input_password = trim($data->password);

                // Fetch registration by ID or email
                $stmt = $conn->prepare("SELECT * FROM registrations WHERE (TRIM(id) = :value OR TRIM(LOWER(email)) = :value) AND status != 'FAILED' LIMIT 1");
                $stmt->bindParam(':value', $value);
                $stmt->execute();
                $record = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($record) {
                    $db_password = isset($record['password']) ? trim($record['password']) : '';
                    $db_mobile = isset($record['mobile']) ? preg_replace('/\D/', '', $record['mobile']) : '';

                    // Validate password: either the set password OR if password is empty, fallback to mobile digits as password
                    $is_valid = false;
                    if (!empty($db_password)) {
                        $is_valid = (strcasecmp($db_password, $input_password) === 0);
                    } else if (!empty($db_mobile)) {
                        $clean_db_mobile = preg_replace('/\D/', '', $db_mobile);
                        $clean_input_mobile = preg_replace('/\D/', '', $input_password);
                        $is_valid = ($clean_db_mobile === $clean_input_mobile) || 
                                    (strlen($clean_db_mobile) >= 10 && strlen($clean_input_mobile) >= 10 && substr($clean_db_mobile, -10) === substr($clean_input_mobile, -10));
                    }

                    if ($is_valid) {
                        echo json_encode(array("success" => true, "record" => $record));
                    } else {
                        http_response_code(401);
                        echo json_encode(array("error" => "Invalid password. For existing users without a set password, please try using your registered 10-digit mobile number as the password."));
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(array("error" => "No active registration record found matching the entered ID/email."));
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database authentication failed: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete details for delegate login."));
        }
        exit();
    }

    // Update Delegate Profile Action
    if (isset($data->action) && $data->action === 'update_profile') {
        if (!empty($data->id) && !empty($data->password)) {
            try {
                $id = trim(htmlspecialchars(strip_tags($data->id)));
                $input_password = trim($data->password);

                // 1. Authenticate first
                $stmt_auth = $conn->prepare("SELECT * FROM registrations WHERE TRIM(id) = :id AND status != 'FAILED' LIMIT 1");
                $stmt_auth->bindParam(':id', $id);
                $stmt_auth->execute();
                $record = $stmt_auth->fetch(PDO::FETCH_ASSOC);

                if (!$record) {
                    http_response_code(404);
                    echo json_encode(array("error" => "Registration record not found."));
                    exit();
                }

                $db_password = isset($record['password']) ? trim($record['password']) : '';
                $db_mobile = isset($record['mobile']) ? preg_replace('/\D/', '', $record['mobile']) : '';

                $is_valid = false;
                if (!empty($db_password)) {
                    $is_valid = (strcasecmp($db_password, $input_password) === 0);
                } else if (!empty($db_mobile)) {
                    $clean_db_mobile = preg_replace('/\D/', '', $db_mobile);
                    $clean_input_mobile = preg_replace('/\D/', '', $input_password);
                    $is_valid = ($clean_db_mobile === $clean_input_mobile) || 
                                (strlen($clean_db_mobile) >= 10 && strlen($clean_input_mobile) >= 10 && substr($clean_db_mobile, -10) === substr($clean_input_mobile, -10));
                }

                if (!$is_valid) {
                    http_response_code(401);
                    echo json_encode(array("error" => "Authentication failed. Unable to save profile changes."));
                    exit();
                }

                // 2. Perform validation/sanitization of editable fields
                $fullName = !empty($data->fullName) ? htmlspecialchars(strip_tags($data->fullName)) : $record['fullName'];
                $gender = !empty($data->gender) ? htmlspecialchars(strip_tags($data->gender)) : null;
                $institution = !empty($data->institution) ? htmlspecialchars(strip_tags($data->institution)) : null;
                $designation = !empty($data->designation) ? htmlspecialchars(strip_tags($data->designation)) : null;
                $councilRegNo = !empty($data->councilRegNo) ? htmlspecialchars(strip_tags($data->councilRegNo)) : null;
                $address = !empty($data->address) ? htmlspecialchars(strip_tags($data->address)) : null;
                $city = !empty($data->city) ? htmlspecialchars(strip_tags($data->city)) : null;
                $state = !empty($data->state) ? htmlspecialchars(strip_tags($data->state)) : null;
                $pincode = !empty($data->pincode) ? htmlspecialchars(strip_tags($data->pincode)) : null;
                $tier = !empty($data->tier) ? htmlspecialchars(strip_tags($data->tier)) : $record['tier'];
                $category = !empty($data->category) ? htmlspecialchars(strip_tags($data->category)) : $record['category'];
                $iaphdNo = !empty($data->iaphdNo) ? htmlspecialchars(strip_tags($data->iaphdNo)) : null;
                $foodPreference = !empty($data->foodPreference) ? htmlspecialchars(strip_tags($data->foodPreference)) : null;
                $hasAccompanying = !empty($data->hasAccompanying) ? htmlspecialchars(strip_tags($data->hasAccompanying)) : 'no';
                $accompanyingName = !empty($data->accompanyingName) ? htmlspecialchars(strip_tags($data->accompanyingName)) : null;
                $accompanyingCount = isset($data->accompanyingCount) ? intval($data->accompanyingCount) : 0;
                $accompanyingFood = !empty($data->accompanyingFood) ? htmlspecialchars(strip_tags($data->accompanyingFood)) : null;
                $profilePic = isset($data->profilePic) ? $data->profilePic : $record['profilePic'];

                // Keep same password, or let them set a new password if they submit one
                $new_password = !empty($data->newPassword) ? trim(htmlspecialchars(strip_tags($data->newPassword))) : $db_password;
                if (empty($new_password)) {
                    $new_password = $input_password; // Fallback to current authenticated password
                }

                // 3. Update the record
                $stmt_update = $conn->prepare("UPDATE registrations SET 
                    fullName = :fullName, gender = :gender, institution = :institution, designation = :designation, 
                    councilRegNo = :councilRegNo, address = :address, city = :city, state = :state, pincode = :pincode, 
                    tier = :tier, category = :category, iaphdNo = :iaphdNo, foodPreference = :foodPreference, 
                    hasAccompanying = :hasAccompanying, accompanyingName = :accompanyingName, accompanyingCount = :accompanyingCount, 
                    accompanyingFood = :accompanyingFood, profilePic = :profilePic, password = :password 
                    WHERE id = :id");

                $stmt_update->bindParam(':fullName', $fullName);
                $stmt_update->bindParam(':gender', $gender);
                $stmt_update->bindParam(':institution', $institution);
                $stmt_update->bindParam(':designation', $designation);
                $stmt_update->bindParam(':councilRegNo', $councilRegNo);
                $stmt_update->bindParam(':address', $address);
                $stmt_update->bindParam(':city', $city);
                $stmt_update->bindParam(':state', $state);
                $stmt_update->bindParam(':pincode', $pincode);
                $stmt_update->bindParam(':tier', $tier);
                $stmt_update->bindParam(':category', $category);
                $stmt_update->bindParam(':iaphdNo', $iaphdNo);
                $stmt_update->bindParam(':foodPreference', $foodPreference);
                $stmt_update->bindParam(':hasAccompanying', $hasAccompanying);
                $stmt_update->bindParam(':accompanyingName', $accompanyingName);
                $stmt_update->bindParam(':accompanyingCount', $accompanyingCount, PDO::PARAM_INT);
                $stmt_update->bindParam(':accompanyingFood', $accompanyingFood);
                $stmt_update->bindParam(':profilePic', $profilePic);
                $stmt_update->bindParam(':password', $new_password);
                $stmt_update->bindParam(':id', $id);
                $stmt_update->execute();

                // Fetch updated record to return
                $stmt_select = $conn->prepare("SELECT * FROM registrations WHERE id = :id LIMIT 1");
                $stmt_select->bindParam(':id', $id);
                $stmt_select->execute();
                $updated_record = $stmt_select->fetch(PDO::FETCH_ASSOC);

                echo json_encode(array("success" => true, "message" => "Profile updated successfully!", "record" => $updated_record));
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(array("error" => "Database update failed: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("error" => "Incomplete details for profile update."));
        }
        exit();
    }
    
    // Default action: Handle Delegate registration insertion
    $fullName_check = isset($data->fullName) ? trim(htmlspecialchars(strip_tags($data->fullName))) : '';
    $email_check = isset($data->email) ? trim(htmlspecialchars(strip_tags($data->email))) : '';
    $mobile_check = isset($data->mobile) ? trim(htmlspecialchars(strip_tags($data->mobile))) : '';
    $tier_check = isset($data->tier) ? trim(htmlspecialchars(strip_tags($data->tier))) : '';
    $category_check = isset($data->category) ? trim(htmlspecialchars(strip_tags($data->category))) : '';

    if (!empty($fullName_check) && !empty($email_check) && !empty($mobile_check) && !empty($tier_check) && !empty($category_check)) {
        try {
            $email = strtolower($email_check);
            $mobile = preg_replace('/\D/', '', $mobile_check);
            if (empty($mobile)) {
                http_response_code(400);
                echo json_encode(array("error" => "Invalid mobile number."));
                exit();
            }

            $fullName = $fullName_check;
            $tier = $tier_check;
            $category = $category_check;

            // Check if email or mobile already exists with a status other than FAILED (this blocks duplicate registrations)
            $stmt_check = $conn->prepare("SELECT email, mobile FROM registrations WHERE (TRIM(LOWER(email)) = :email OR REPLACE(mobile, ' ', '') = :mobile) AND status != 'FAILED' LIMIT 1");
            $stmt_check->bindParam(':email', $email);
            $stmt_check->bindParam(':mobile', $mobile);
            $stmt_check->execute();
            $existing = $stmt_check->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                http_response_code(400);
                echo json_encode(array("error" => "You are already registered. Duplicate registrations are not accepted."));
                exit();
            }

            // Check if there is an existing failed registration to update/reuse
            $stmt_failed = $conn->prepare("SELECT id FROM registrations WHERE (TRIM(LOWER(email)) = :email OR REPLACE(mobile, ' ', '') = :mobile) AND status = 'FAILED' LIMIT 1");
            $stmt_failed->bindParam(':email', $email);
            $stmt_failed->bindParam(':mobile', $mobile);
            $stmt_failed->execute();
            $failed_row = $stmt_failed->fetch(PDO::FETCH_ASSOC);

            $is_update = false;
            $existing_failed_id = null;
            if ($failed_row) {
                $is_update = true;
                $existing_failed_id = $failed_row['id'];
            }

            $status = !empty($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'PENDING';

            $generated_password = null;
            if ($status !== 'FAILED') {
                $generated_password = substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 8);
            }

            if ($status === 'FAILED') {
                if ($is_update) {
                    $generated_id = $existing_failed_id;
                } else {
                    $generated_id = "FAIL-" . strtoupper(uniqid());
                }
            } else if ($offline_online === 'offline' && $status === 'PENDING') {
                // Generate sequential registration ID like OFFLINE-0001
                $stmt_count = $conn->prepare("SELECT id FROM registrations WHERE id LIKE 'OFFLINE-%' ORDER BY LENGTH(id) DESC, id DESC LIMIT 1");
                $stmt_count->execute();
                $latest = $stmt_count->fetch(PDO::FETCH_ASSOC);

                if ($latest) {
                    $num = intval(str_replace('OFFLINE-', '', $latest['id']));
                    $next_num = $num + 1;
                } else {
                    $next_num = 1;
                }
                $generated_id = "OFFLINE-" . str_pad($next_num, 4, "0", STR_PAD_LEFT);
            } else {
                // Generate sequential registration ID like NATCON-SD-001 or NATCON-FD-001
                $is_student = (stripos($category, 'Student') !== false);
                $prefix = $is_student ? 'NATCON-SD-' : 'NATCON-FD-';

                $stmt_count = $conn->prepare("SELECT id FROM registrations WHERE id LIKE :prefix ORDER BY LENGTH(id) DESC, id DESC LIMIT 1");
                $prefix_like = $prefix . '%';
                $stmt_count->bindParam(':prefix', $prefix_like);
                $stmt_count->execute();
                $latest = $stmt_count->fetch(PDO::FETCH_ASSOC);

                if ($latest) {
                    $num = intval(str_replace($prefix, '', $latest['id']));
                    $next_num = $num + 1;
                } else {
                    $next_num = 1;
                }
                $generated_id = $prefix . str_pad($next_num, 3, "0", STR_PAD_LEFT);
            }

            // Clean inputs for optional and other fields
            $gender = !empty($data->gender) ? htmlspecialchars(strip_tags($data->gender)) : null;
            $institution = !empty($data->institution) ? htmlspecialchars(strip_tags($data->institution)) : null;
            $designation = !empty($data->designation) ? htmlspecialchars(strip_tags($data->designation)) : null;
            $councilRegNo = !empty($data->councilRegNo) ? htmlspecialchars(strip_tags($data->councilRegNo)) : null;
            $address = !empty($data->address) ? htmlspecialchars(strip_tags($data->address)) : null;
            $city = !empty($data->city) ? htmlspecialchars(strip_tags($data->city)) : null;
            $state = !empty($data->state) ? htmlspecialchars(strip_tags($data->state)) : null;
            $pincode = !empty($data->pincode) ? htmlspecialchars(strip_tags($data->pincode)) : null;
            $iaphdNo = !empty($data->iaphdNo) ? htmlspecialchars(strip_tags($data->iaphdNo)) : null;
            $foodPreference = !empty($data->foodPreference) ? htmlspecialchars(strip_tags($data->foodPreference)) : null;
            $hasAccompanying = !empty($data->hasAccompanying) ? htmlspecialchars(strip_tags($data->hasAccompanying)) : 'no';
            $accompanyingName = !empty($data->accompanyingName) ? htmlspecialchars(strip_tags($data->accompanyingName)) : null;
            $accompanyingCount = !empty($data->accompanyingCount) ? intval($data->accompanyingCount) : 0;
            $accompanyingFood = !empty($data->accompanyingFood) ? htmlspecialchars(strip_tags($data->accompanyingFood)) : null;
            $transactionId = !empty($data->transactionId) ? htmlspecialchars(strip_tags($data->transactionId)) : null;
            $paymentDate = !empty($data->paymentDate) ? htmlspecialchars(strip_tags($data->paymentDate)) : null;
            $amountPaid = !empty($data->amountPaid) ? floatval($data->amountPaid) : 0.00;
            $offline_online = !empty($data->offline_online) ? htmlspecialchars(strip_tags($data->offline_online)) : 'online';
            $profilePic = !empty($data->profilePic) ? $data->profilePic : null;
            $paymentScreenshot = !empty($data->paymentScreenshot) ? $data->paymentScreenshot : null;

            if ($is_update) {
                $query = "UPDATE registrations SET 
                    id = :id, fullName = :fullName, email = :email, mobile = :mobile, gender = :gender, institution = :institution, 
                    designation = :designation, councilRegNo = :councilRegNo, address = :address, city = :city, state = :state, 
                    pincode = :pincode, tier = :tier, category = :category, iaphdNo = :iaphdNo, foodPreference = :foodPreference, 
                    hasAccompanying = :hasAccompanying, accompanyingName = :accompanyingName, accompanyingCount = :accompanyingCount, 
                    accompanyingFood = :accompanyingFood, transactionId = :transactionId, paymentDate = :paymentDate, 
                    amountPaid = :amountPaid, status = :status, offline_online = :offline_online, profilePic = :profilePic,
                    paymentScreenshot = :paymentScreenshot, password = :password
                    WHERE id = :existing_id";
                
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':existing_id', $existing_failed_id);
            } else {
                $query = "INSERT INTO registrations 
                    (id, fullName, email, mobile, gender, institution, designation, councilRegNo, address, city, state, pincode, tier, category, iaphdNo, foodPreference, hasAccompanying, accompanyingName, accompanyingCount, accompanyingFood, transactionId, paymentDate, amountPaid, status, offline_online, profilePic, paymentScreenshot, password) 
                    VALUES (:id, :fullName, :email, :mobile, :gender, :institution, :designation, :councilRegNo, :address, :city, :state, :pincode, :tier, :category, :iaphdNo, :foodPreference, :hasAccompanying, :accompanyingName, :accompanyingCount, :accompanyingFood, :transactionId, :paymentDate, :amountPaid, :status, :offline_online, :profilePic, :paymentScreenshot, :password)";
                
                $stmt = $conn->prepare($query);
            }
            
            // Bind values
            $stmt->bindParam(':id', $generated_id);
            $stmt->bindParam(':fullName', $fullName);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':mobile', $mobile);
            $stmt->bindParam(':gender', $gender);
            $stmt->bindParam(':institution', $institution);
            $stmt->bindParam(':designation', $designation);
            $stmt->bindParam(':councilRegNo', $councilRegNo);
            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':state', $state);
            $stmt->bindParam(':pincode', $pincode);
            $stmt->bindParam(':tier', $tier);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':iaphdNo', $iaphdNo);
            $stmt->bindParam(':foodPreference', $foodPreference);
            $stmt->bindParam(':hasAccompanying', $hasAccompanying);
            $stmt->bindParam(':accompanyingName', $accompanyingName);
            $stmt->bindParam(':accompanyingCount', $accompanyingCount, PDO::PARAM_INT);
            $stmt->bindParam(':accompanyingFood', $accompanyingFood);
            $stmt->bindParam(':transactionId', $transactionId);
            $stmt->bindParam(':paymentDate', $paymentDate);
            $stmt->bindParam(':amountPaid', $amountPaid);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':offline_online', $offline_online);
            $stmt->bindParam(':profilePic', $profilePic);
            $stmt->bindParam(':paymentScreenshot', $paymentScreenshot);
            $stmt->bindParam(':password', $generated_password);
            
            $stmt->execute();
            
            // ── MAIL INTEGRATION ───────────────────────────────────────────
            if ($status !== 'FAILED') {
                if ($offline_online === 'offline' && $status === 'PENDING') {
                    // Send a "Registration Received - Pending Verification" email
                    try {
                        $to = $email;
                        $subject = "Offline Registration Received - 30th IAPHD NATCON 2026 (ID: $generated_id)";
                        
                        $message = "
                        <html>
                        <head>
                            <title>30th IAPHD NATCON 2026 Registration Received</title>
                            <style>
                                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; color: #333333; margin: 0; padding: 0; }
                                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
                                .header { background-color: #002147; padding: 40px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #d90a2c; }
                                .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                                .content { padding: 40px 30px; }
                                .greeting { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 20px; }
                                .badge { display: inline-block; background-color: #718096; color: #ffffff; font-weight: 800; padding: 8px 16px; border-radius: 4px; font-size: 14px; letter-spacing: 1px; margin-bottom: 30px; }
                                .footer { background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #718096; line-height: 1.6; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                " . get_email_header_html($conn) . "
                                <div class='content'>
                                    <div class='greeting'>Dear $fullName,</div>
                                    <p style='font-size: 14px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;'>
                                        Thank you for registering for the 30th IAPHD National Conference (IAPHD NATCON 2026) in Visakhapatnam. We have received your offline registration request.
                                    </p>
                                    <div style='text-align: center;'>
                                        <div class='badge'>PENDING ID: $generated_id</div>
                                    </div>
                                    <p style='font-size: 13px; line-height: 1.6; color: #2d3748;'>
                                        Your registration status is currently <strong>PENDING</strong>. Once our organizing committee verifies your registration, your status will be updated to <strong>CONFIRMED</strong>, and your official confirmed Registration ID and E-Receipt will be emailed to you.
                                    </p>
                                </div>
                                <div class='footer'>
                                    <strong>30th IAPHD NATCON 2026 Visakhapatnam</strong><br>
                                    Department of Public Health Dentistry, ANIDS<br>
                                    <a href='https://iaphdnatcon2026.com/'>iaphdnatcon2026.com</a>
                                </div>
                            </div>
                        </body>
                        </html>";

                        send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                    } catch (Throwable $mailErr) {
                        @file_put_contents(__DIR__ . '/smtp_error.log', "[" . date('Y-m-d H:i:s') . "] Offline received email failed: " . $mailErr->getMessage() . "\n", FILE_APPEND);
                    }
                } else {
                    try {
                        $to = $email;
                        $subject = "30th IAPHD NATCON 2026 Registration Confirmation";
                        $message = generate_confirmation_email_html($fullName, $generated_id, $category, $conn);
                        
                        // Send SMTP email to delegate
                        $record_data = array(
                            'id' => $generated_id,
                            'fullName' => $fullName,
                            'email' => $email,
                            'mobile' => $mobile,
                            'city' => $city,
                            'category' => $category,
                            'tier' => $tier,
                            'transactionId' => $transactionId,
                            'amountPaid' => $amountPaid,
                            'paymentDate' => $paymentDate,
                            'status' => $status
                        );
                        
                        $attachment_path = generate_receipt_image($record_data);
                        $attachment_name = "E-Receipt_" . $generated_id . ".png";
                        
                        send_smtp_email($to, $subject, $message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth, $attachment_path, $attachment_name);
                        
                        if ($attachment_path && file_exists($attachment_path)) {
                            @unlink($attachment_path);
                        }
                        
                        // Send SMTP notification email to admin
                        $admin_email = "ungatisrinu@gmail.com";
                        $admin_subject = "New Registration - $generated_id ($fullName)";
                        $admin_message = "
                        <html>
                        <body>
                            <h2>New Registration Confirmed</h2>
                            <p><strong>ID:</strong> $generated_id</p>
                            <p><strong>Name:</strong> $fullName</p>
                            <p><strong>Email:</strong> $email</p>
                            <p><strong>Mobile:</strong> $mobile</p>
                            <p><strong>City:</strong> $city</p>
                            <p><strong>Category:</strong> $category</p>
                            <p><strong>Tier:</strong> $tier</p>
                            <p><strong>Transaction ID:</strong> " . ($transactionId ? $transactionId : 'N/A') . "</p>
                            <p><strong>Amount:</strong> ₹" . number_format($amountPaid) . "</p>
                            <p><strong>Status:</strong> $status</p>
                        </body>
                        </html>";
                        send_smtp_email($admin_email, $admin_subject, $admin_message, $smtp_host, $smtp_port, $smtp_user, $smtp_pass, $smtp_auth);
                    } catch (Throwable $e) {
                        // Silent catch to avoid blocking the API response in case mail server is offline
                        @file_put_contents(__DIR__ . '/smtp_error.log', "[" . date('Y-m-d H:i:s') . "] Mail block failed: " . $e->getMessage() . "\n", FILE_APPEND);
                    }
                }
            }
            
            http_response_code($is_update ? 200 : 201);
            echo json_encode(array(
                "success" => true, 
                "message" => $is_update ? "Registration details updated inside MySQL database." : "Registration details recorded inside MySQL database.",
                "id" => $generated_id,
                "password" => $generated_password
            ));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to write registration: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Incomplete data fields."));
    }
}
?>
