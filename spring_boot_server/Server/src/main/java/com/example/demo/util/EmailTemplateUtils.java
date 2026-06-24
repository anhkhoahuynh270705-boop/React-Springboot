package com.example.demo.util;

import com.example.demo.dto.BookingConfirmationEmailDto;

public final class EmailTemplateUtils {

    private EmailTemplateUtils() {
    }

    public static String passwordResetBody(String resetUrl) {
        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "  <title>Reset Your Password - HAK Cinema</title>" +
            "</head>" +
            "<body style='margin:0;padding:0;background-color:#0a0a0f;font-family:\"Segoe UI\",Arial,sans-serif;'>" +
            "  <table width='100%' cellpadding='0' cellspacing='0' style='background:linear-gradient(135deg,#0a0a0f 0%,#1a0a2e 50%,#0a0a0f 100%);min-height:100vh;'>" +
            "    <tr><td align='center' style='padding:40px 20px;'>" +

            "      <!-- Main Card -->" +
            "      <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>" +

            "        <!-- Header -->" +
            "        <tr><td style='background:linear-gradient(135deg,#1a0a2e,#2d1b69,#1a0a2e);border-radius:20px 20px 0 0;padding:0;overflow:hidden;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding:50px 40px 40px;'>" +
            "              <!-- Cinema Logo Icon -->" +
            "              <div style='display:inline-block;background:linear-gradient(135deg,#e50914,#ff6b35);border-radius:50%;width:80px;height:80px;line-height:80px;text-align:center;font-size:36px;margin-bottom:20px;box-shadow:0 0 40px rgba(229,9,20,0.6);'>🎬</div>" +
            "              <br>" +
            "              <span style='font-size:28px;font-weight:800;color:#ffffff;letter-spacing:3px;text-shadow:0 0 20px rgba(229,9,20,0.8);'>HAK CINEMA</span>" +
            "              <br><br>" +
            "              <!-- Decorative line -->" +
            "              <div style='width:80px;height:3px;background:linear-gradient(90deg,transparent,#e50914,transparent);margin:0 auto;'></div>" +
            "            </td></tr>" +
            "          </table>" +
            "        </td></tr>" +

            "        <!-- Body -->" +
            "        <tr><td style='background:linear-gradient(180deg,#12071e,#1a0e30);padding:50px 50px;'>" +

            "          <!-- Lock Icon -->" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding-bottom:30px;'>" +
            "              <div style='display:inline-block;background:rgba(229,9,20,0.1);border:2px solid rgba(229,9,20,0.3);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;font-size:32px;'>🔐</div>" +
            "            </td></tr>" +
            "          </table>" +

            "          <!-- Title -->" +
            "          <h1 style='margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;text-align:center;'>Password Reset Request</h1>" +
            "          <p style='margin:0 0 30px;font-size:15px;color:#9b8fc4;text-align:center;line-height:1.6;'>We received a request to reset your HAK Cinema account password.</p>" +

            "          <!-- Divider -->" +
            "          <div style='height:1px;background:linear-gradient(90deg,transparent,rgba(229,9,20,0.5),transparent);margin-bottom:30px;'></div>" +

            "          <!-- Message -->" +
            "          <p style='margin:0 0 15px;font-size:15px;color:#c8b8f0;line-height:1.7;'>Hello,</p>" +
            "          <p style='margin:0 0 30px;font-size:15px;color:#c8b8f0;line-height:1.7;'>Click the button below to reset your password. This link is valid for <strong style='color:#e50914;'>15 minutes</strong>.</p>" +

            "          <!-- CTA Button -->" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding:10px 0 35px;'>" +
            "              <a href='" + resetUrl + "' style='display:inline-block;background:linear-gradient(135deg,#e50914,#ff4444);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:18px 50px;border-radius:50px;letter-spacing:1px;box-shadow:0 8px 30px rgba(229,9,20,0.5);'>Reset My Password</a>" +
            "            </td></tr>" +
            "          </table>" +

            "          <!-- Alt link box -->" +
            "          <div style='background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:30px;'>" +
            "            <p style='margin:0 0 8px;font-size:13px;color:#7b6d9e;'>If the button does not work, copy this link:</p>" +
            "            <p style='margin:0;font-size:13px;color:#9b8fc4;word-break:break-all;'>" + resetUrl + "</p>" +
            "          </div>" +

            "          <!-- Warning box -->" +
            "          <div style='background:rgba(229,9,20,0.08);border-left:4px solid #e50914;border-radius:0 8px 8px 0;padding:15px 20px;'>" +
            "            <p style='margin:0;font-size:13px;color:#c8b8f0;line-height:1.6;'>⚠️ If you did not request this, please ignore this email. Your account is still secure.</p>" +
            "          </div>" +

            "        </td></tr>" +

            "        <!-- Footer -->" +
            "        <tr><td style='background:#0d0720;border-radius:0 0 20px 20px;padding:30px 50px;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr>" +
            "              <td align='center'>" +
            "                <!-- Star decorations -->" +
            "                <p style='margin:0 0 15px;font-size:20px;letter-spacing:8px;'>✨ 🎬 ✨</p>" +
            "                <p style='margin:0 0 5px;font-size:13px;color:#5a4e7a;'>© 2025 HAK Cinema. All rights reserved.</p>" +
            "                <p style='margin:0;font-size:12px;color:#3d3358;'>This is an automated email, please do not reply.</p>" +
            "              </td>" +
            "            </tr>" +
            "          </table>" +
            "        </td></tr>" +

            "        <!-- Bottom glow line -->" +
            "        <tr><td style='height:4px;background:linear-gradient(90deg,#e50914,#ff6b35,#e50914);border-radius:0 0 4px 4px;'></td></tr>" +

            "      </table>" +

            "    </td></tr>" +
            "  </table>" +
            "</body>" +
            "</html>";
    }

    public static String passwordResetSuccessBody() {
        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "  <title>Password Reset Successful - HAK Cinema</title>" +
            "</head>" +
            "<body style='margin:0;padding:0;background-color:#0a0a0f;font-family:\"Segoe UI\",Arial,sans-serif;'>" +
            "  <table width='100%' cellpadding='0' cellspacing='0' style='background:linear-gradient(135deg,#0a0a0f 0%,#071a0a 50%,#0a0a0f 100%);min-height:100vh;'>" +
            "    <tr><td align='center' style='padding:40px 20px;'>" +

            "      <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>" +

            "        <!-- Header -->" +
            "        <tr><td style='background:linear-gradient(135deg,#071a0a,#0d2e12,#071a0a);border-radius:20px 20px 0 0;padding:0;overflow:hidden;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding:50px 40px 40px;'>" +
            "              <div style='display:inline-block;background:linear-gradient(135deg,#1db954,#17a346);border-radius:50%;width:80px;height:80px;line-height:80px;text-align:center;font-size:36px;margin-bottom:20px;box-shadow:0 0 40px rgba(29,185,84,0.6);'>🎬</div>" +
            "              <br>" +
            "              <span style='font-size:28px;font-weight:800;color:#ffffff;letter-spacing:3px;text-shadow:0 0 20px rgba(29,185,84,0.6);'>HAK CINEMA</span>" +
            "              <br><br>" +
            "              <div style='width:80px;height:3px;background:linear-gradient(90deg,transparent,#1db954,transparent);margin:0 auto;'></div>" +
            "            </td></tr>" +
            "          </table>" +
            "        </td></tr>" +

            "        <!-- Body -->" +
            "        <tr><td style='background:linear-gradient(180deg,#071209,#0d1a10);padding:50px 50px;'>" +

            "          <!-- Success Icon -->" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding-bottom:30px;'>" +
            "              <div style='display:inline-block;background:rgba(29,185,84,0.15);border:2px solid rgba(29,185,84,0.4);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;font-size:36px;'>✅</div>" +
            "            </td></tr>" +
            "          </table>" +

            "          <!-- Title -->" +
            "          <h1 style='margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;text-align:center;'>Password Reset Successful!</h1>" +
            "          <p style='margin:0 0 30px;font-size:15px;color:#6abf80;text-align:center;line-height:1.6;'>Your HAK Cinema account password has been changed.</p>" +

            "          <!-- Divider -->" +
            "          <div style='height:1px;background:linear-gradient(90deg,transparent,rgba(29,185,84,0.5),transparent);margin-bottom:30px;'></div>" +

            "          <!-- Message -->" +
            "          <p style='margin:0 0 15px;font-size:15px;color:#a8d8b4;line-height:1.7;'>Hello,</p>" +
            "          <p style='margin:0 0 30px;font-size:15px;color:#a8d8b4;line-height:1.7;'>Your password has been <strong style='color:#1db954;'>successfully reset</strong>. You can now log in with your new password and enjoy the cinema experience.</p>" +

            "          <!-- CTA Button -->" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding:10px 0 35px;'>" +
            "              <a href='http://localhost:5173/login' style='display:inline-block;background:linear-gradient(135deg,#1db954,#17a346);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:18px 50px;border-radius:50px;letter-spacing:1px;box-shadow:0 8px 30px rgba(29,185,84,0.4);'>🎥 Back to HAK Cinema</a>" +
            "            </td></tr>" +
            "          </table>" +

            "          <!-- Warning box -->" +
            "          <div style='background:rgba(229,9,20,0.08);border-left:4px solid #e50914;border-radius:0 8px 8px 0;padding:15px 20px;'>" +
            "            <p style='margin:0;font-size:13px;color:#a8d8b4;line-height:1.6;'>⚠️ If you did not make this change, please contact our support team immediately — your account may be compromised.</p>" +
            "          </div>" +

            "        </td></tr>" +

            "        <!-- Footer -->" +
            "        <tr><td style='background:#050d07;border-radius:0 0 20px 20px;padding:30px 50px;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr>" +
            "              <td align='center'>" +
            "                <p style='margin:0 0 15px;font-size:20px;letter-spacing:8px;'>✨ 🎬 ✨</p>" +
            "                <p style='margin:0 0 5px;font-size:13px;color:#3a5a42;'>© 2025 HAK Cinema. All rights reserved.</p>" +
            "                <p style='margin:0;font-size:12px;color:#2a3d2f;'>This is an automated email, please do not reply.</p>" +
            "              </td>" +
            "            </tr>" +
            "          </table>" +
            "        </td></tr>" +

            "        <!-- Bottom glow line -->" +
            "        <tr><td style='height:4px;background:linear-gradient(90deg,#1db954,#17a346,#1db954);border-radius:0 0 4px 4px;'></td></tr>" +

            "      </table>" +

            "    </td></tr>" +
            "  </table>" +
            "</body>" +
            "</html>";
    }

    public static String bookingConfirmationBody(BookingConfirmationEmailDto dto) {

        String posterHtml = (dto.getMoviePoster() != null && !dto.getMoviePoster().isBlank())
                ? "<img src='" + dto.getMoviePoster() + "' alt='" + dto.getMovieTitle() + "' style='width:100%;max-width:200px;border-radius:10px;display:block;margin:0 auto;box-shadow:0 8px 25px rgba(0,0,0,0.5);'/>"
                : "<div style='width:160px;height:220px;background:linear-gradient(135deg,#1a0a2e,#2d1b69);border-radius:10px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:48px;'>🎬</div>";

        String formattedPrice = String.format("%,.0f VNĐ", dto.getTotalPrice());

        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "  <title>Booking Confirmed - HAK Cinema</title>" +
            "</head>" +
            "<body style='margin:0;padding:0;background-color:#0a0a0f;font-family:\"Segoe UI\",Arial,sans-serif;'>" +
            "  <table width='100%' cellpadding='0' cellspacing='0' style='background:linear-gradient(135deg,#0a0a0f 0%,#0f0a1e 40%,#1a0a10 100%);min-height:100vh;'>" +
            "    <tr><td align='center' style='padding:40px 20px;'>" +

            "      <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>" +

            //  HEADER 
            "        <tr><td style='background:linear-gradient(135deg,#1a0a10,#3d0a1a,#1a0a10);border-radius:20px 20px 0 0;padding:0;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center' style='padding:45px 40px 35px;'>" +
            "              <div style='display:inline-block;background:linear-gradient(135deg,#e50914,#ff6b35);border-radius:50%;width:80px;height:80px;line-height:80px;text-align:center;font-size:36px;margin-bottom:18px;box-shadow:0 0 40px rgba(229,9,20,0.7);'>🎬</div>" +
            "              <br>" +
            "              <span style='font-size:26px;font-weight:800;color:#ffffff;letter-spacing:3px;text-shadow:0 0 20px rgba(229,9,20,0.7);'>HAK CINEVERSE</span>" +
            "              <br><br>" +
            "              <div style='width:80px;height:3px;background:linear-gradient(90deg,transparent,#e50914,transparent);margin:0 auto 18px;'></div>" +
            "              <span style='font-size:13px;color:#d4a0aa;letter-spacing:2px;text-transform:uppercase;'>Booking Confirmation</span>" +
            "            </td></tr>" +
            "          </table>" +
            "        </td></tr>" +

            // SUCCESS BANNER 
            "        <tr><td style='background:linear-gradient(135deg,#1a2a0a,#0d1f05);padding:25px 40px;text-align:center;'>" +
            "          <div style='display:inline-block;background:rgba(29,185,84,0.15);border:2px solid rgba(29,185,84,0.4);border-radius:50px;padding:10px 30px;'>" +
            "            <span style='font-size:15px;font-weight:700;color:#1db954;letter-spacing:1px;'> PAYMENT SUCCESSFUL</span>" +
            "          </div>" +
            "        </td></tr>" +

            "        <tr><td style='background:linear-gradient(180deg,#100818,#160d22);padding:40px 45px;'>" +

            "          <p style='margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;'>Hello, " + dto.getUserName() + "! </p>" +
            "          <p style='margin:0 0 30px;font-size:14px;color:#9b8fc4;line-height:1.6;'>Your ticket has been <strong style='color:#1db954;'>confirmed</strong>. Here are your booking details:</p>" +

            // TICKET CARD
            "          <div style='background:rgba(255,255,255,0.04);border:1px solid rgba(229,9,20,0.25);border-radius:16px;overflow:hidden;margin-bottom:25px;'>" +

            // Movie poster + title row
            "            <table width='100%' cellpadding='0' cellspacing='0'>" +
            "              <tr>" +
            "                <td width='180' style='padding:20px;vertical-align:top;'>" + posterHtml + "</td>" +
            "                <td style='padding:20px 20px 20px 10px;vertical-align:top;'>" +
            "                  <p style='margin:0 0 6px;font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;'>" + dto.getMovieTitle() + "</p>" +
            "                  <p style='margin:0 0 16px;font-size:12px;color:#e50914;letter-spacing:1px;font-weight:600;text-transform:uppercase;'>Now Showing</p>" +
            "                  <div style='height:1px;background:rgba(255,255,255,0.08);margin-bottom:16px;'></div>" +
            // Detail rows
            "                  <table cellpadding='0' cellspacing='0'>" +
            "                    <tr><td style='padding:4px 0;'><span style='font-size:12px;color:#6b5e8a;'>Cinema</span></td></tr>" +
            "                    <tr><td style='padding:0 0 10px;'><span style='font-size:13px;color:#c8b8f0;font-weight:600;'>" + dto.getCinemaName() + "</span></td></tr>" +
            "                    <tr><td style='padding:4px 0;'><span style='font-size:12px;color:#6b5e8a;'>Date &amp; Time</span></td></tr>" +
            "                    <tr><td style='padding:0 0 10px;'><span style='font-size:13px;color:#c8b8f0;font-weight:600;'>" + dto.getShowDate() + " &nbsp;|&nbsp; " + dto.getShowTime() + "</span></td></tr>" +
            "                    <tr><td style='padding:4px 0;'><span style='font-size:12px;color:#6b5e8a;'>Seat(s)</span></td></tr>" +
            "                    <tr><td style='padding:0;'><span style='font-size:13px;color:#c8b8f0;font-weight:600;'>" + dto.getSeatNumber() + "</span></td></tr>" +
            "                  </table>" +
            "                </td>" +
            "              </tr>" +
            "            </table>" +

            // Dashed divider (ticket tear)
            "            <div style='border-top:2px dashed rgba(255,255,255,0.1);margin:0 20px;position:relative;'></div>" +

            // Bottom strip: ticket # + price
            "            <table width='100%' cellpadding='0' cellspacing='0' style='padding:18px 20px;'>" +
            "              <tr>" +
            "                <td>" +
            "                  <p style='margin:0 0 3px;font-size:11px;color:#6b5e8a;text-transform:uppercase;letter-spacing:1px;'>Ticket Number</p>" +
            "                  <p style='margin:0;font-size:15px;font-weight:800;color:#e50914;letter-spacing:2px;'>#" + dto.getTicketNumber() + "</p>" +
            "                </td>" +
            "                <td align='right'>" +
            "                  <p style='margin:0 0 3px;font-size:11px;color:#6b5e8a;text-transform:uppercase;letter-spacing:1px;'>Total Paid</p>" +
            "                  <p style='margin:0;font-size:18px;font-weight:800;color:#1db954;'>" + formattedPrice + "</p>" +
            "                </td>" +
            "              </tr>" +
            "            </table>" +
            "          </div>" +

            "          <div style='background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;margin-bottom:25px;'>" +
            "            <table width='100%' cellpadding='0' cellspacing='0'>" +
            "              <tr>" +
            "                <td><span style='font-size:13px;color:#9b8fc4;'>Payment Method</span></td>" +
            "                <td align='right'><span style='font-size:13px;color:#ffffff;font-weight:600;'>" + dto.getPaymentMethod() + "</span></td>" +
            "              </tr>" +
            "              <tr><td colspan='2' style='height:10px;'></td></tr>" +
            "              <tr>" +
            "                <td align='right'><span style='font-size:13px;color:#c8b8f0;'>" + dto.getCinemaAddress() + "</span></td>" +
            "              </tr>" +
            "            </table>" +
            "          </div>" +

            "          <div style='background:rgba(229,9,20,0.06);border:1px solid rgba(229,9,20,0.2);border-radius:12px;padding:22px 20px;margin-bottom:25px;text-align:center;'>" +
            "            <p style='margin:0 0 4px;font-size:14px;font-weight:700;color:#ffffff;'>Your Ticket QR Code</p>" +
            "            <p style='margin:0 0 16px;font-size:13px;color:#9b8fc4;'>Scan this QR Code at the cinema entrance to check in</p>" +
            "            <div style='background-color:#ffffff;padding:15px;display:inline-block;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.3);margin-bottom:12px;'>" +
            "              <img src='https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=000000&bgcolor=FFFFFF&data=" + dto.getQrCode() + "' alt='Ticket QR Code' style='display:block;width:160px;height:160px;'/>" +
            "            </div>" +
            "            <div style='margin-top:6px;'>" +
            "              <span style='font-size:11px;color:#8f85b0;display:block;margin-bottom:4px;'>TICKET CODE</span>" +
            "              <code style='font-size:14px;color:#e50914;letter-spacing:2px;font-weight:800;background:rgba(0,0,0,0.3);padding:4px 12px;border-radius:6px;display:inline-block;'>" + dto.getQrCode() + "</code>" +
            "            </div>" +
            "          </div>" +

            "          <p style='margin:0;font-size:12px;color:#5a4e7a;text-align:center;line-height:1.7;'>Please arrive at least <strong style='color:#9b8fc4;'>15 minutes</strong> before the show starts.<br>Tickets are non-transferable and valid for the booked show only.</p>" +

            "        </td></tr>" +
            "        <tr><td style='background:#0a0712;border-radius:0 0 20px 20px;padding:28px 45px;'>" +
            "          <table width='100%' cellpadding='0' cellspacing='0'>" +
            "            <tr><td align='center'>" +
            "              <p style='margin:0 0 12px;font-size:20px;letter-spacing:8px;'>✨ 🎬 ✨</p>" +
            "              <p style='margin:0 0 5px;font-size:13px;color:#4a3d6a;'>Enjoy the show! See you at HAK Cinema.</p>" +
            "              <p style='margin:0 0 5px;font-size:12px;color:#3a2d55;'>© 2025 HAK Cinema. All rights reserved.</p>" +
            "              <p style='margin:0;font-size:11px;color:#2a1f40;'>This is an automated email, please do not reply.</p>" +
            "            </td></tr>" +
            "          </table>" +
            "        </td></tr>" +

            "        <tr><td style='height:4px;background:linear-gradient(90deg,#e50914,#ff6b35,#e50914);border-radius:0 0 4px 4px;'></td></tr>" +
            "      </table>" +
            "    </td></tr>" +
            "  </table>" +
            "</body>" +
            "</html>";
    }
}