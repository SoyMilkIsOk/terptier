// src/lib/emailTemplates.ts

export function weeklyDropsEmail(baseUrl: string, profileSlug: string) {
  const dropsUrl = `${baseUrl}/drops`;
  const unsubscribeUrl = `${baseUrl}/profile/${profileSlug}`;
  const logoUrl = "https://terptier.com/TerpTier.png";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly Drops</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 32px; text-align: center; }
      .logo { width: 120px; height: 120px; margin: 0 auto 20px; display: block; }
      .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; }
      .header-subtitle { color: #d1fae5; margin: 8px 0 0; font-size: 16px; }
      .content { padding: 40px 32px; }
      h1 { color: #065f46; }
      p { color: #374151; line-height: 1.6; font-size: 16px; }
      .btn { display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; margin-top: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
      .btn:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
      .highlights { background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 32px 0; }
      .highlights h3 { color: #10b981; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
      .highlights p { margin: 0; font-size: 15px; }
      .unsubscribe { margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
      .unsubscribe a { color: #10b981; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="TerpTier Logo" class="logo" />
        <h1>What's Dropping This Week?</h1>
        <p class="header-subtitle">Fresh picks curated just for you</p>
      </div>
      <div class="content">
        <p>Happy Sunday! 👋</p>
        <p>Here's what's happening this week on TerpTier. New strains are dropping soon — don't miss out on what's trending!</p>
        
        <div class="highlights">
          <h3>What's Inside</h3>
          <p>
            ✨ Exclusive new drops<br>
            🔥 Trending products<br>
            💎 Limited edition strains<br>
            🎖️ Vote for your favorites
          </p>
        </div>
        
        <p style="text-align:center;">
          <a href="${dropsUrl}" class="btn">View This Week's Drops</a>
        </p>
        
        <p class="unsubscribe">
          You're receiving this email because you opted in to weekly updates.<br>
          If you'd prefer not to receive these emails, you can <a href="${unsubscribeUrl}">manage your preferences here</a>.
        </p>
      </div>
    </div>
  </body>
</html>`;
}