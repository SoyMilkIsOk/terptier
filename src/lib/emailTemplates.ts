export function weeklyDropsEmail(baseUrl: string, profileSlug: string) {
  const dropsUrl = `${baseUrl}/drops`;
  const unsubscribeUrl = `${baseUrl}/profile/${profileSlug}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly Drops</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px; border-radius: 8px; }
      h1 { color: #065f46; }
      p { color: #374151; line-height: 1.5; }
      .btn { display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; margin-top: 16px; }
      .unsubscribe { margin-top: 40px; font-size: 12px; color: #6b7280; }
      .unsubscribe a { color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>This Week's Drops</h1>
      <p>Happy Sunday! Here's what's happening this week on Terptier.</p>
      <p>New strains are dropping soon. Don't miss out!</p>
      <p style="text-align:center;">
        <a href="${dropsUrl}" class="btn">Check out this week's drops</a>
      </p>
      <p class="unsubscribe">
        If you'd prefer not to receive these emails, you can <a href="${unsubscribeUrl}">unsubscribe here</a>.
      </p>
    </div>
  </body>
</html>`;
}
