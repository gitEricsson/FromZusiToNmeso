# Deploying From Zusi to Nmeso (free)

The site deploys from GitHub so Netlify can also build the email function.
Dragging the folder onto Netlify Drop would publish the page, but the styled email
would never be sent, because Drop doesn't run functions.

## 1. Connect the repo
1. Log in at https://app.netlify.com (a free account is fine).
2. **Add new site → Import an existing project → GitHub**, then pick
   `gitEricsson/FromZusiToNmeso`.
3. Leave the build command empty. The publish directory (`site`) and the
   functions folder are read from `netlify.toml`. Click **Deploy**.
4. Optional: **Site configuration → Change site name** to `fromzusitonmeso`,
   so the link becomes `https://fromzusitonmeso.netlify.app`.

Every push to `main` redeploys the site automatically.

## 2. Turn on form detection (one time)
1. Open **Forms** in the site dashboard and click **Enable form detection**.
2. Go to **Deploys → Trigger deploy → Deploy site** so Netlify scans the form.
3. A form called **gift** now shows up under Forms.

## 3. Let the function send the email
The email goes out through Brevo's SMTP relay (the same setup as the Proposal site),
to omoeguare@gmail.com only.

1. Log in at https://app.brevo.com and open **SMTP & API → SMTP keys**.
   Generate a key (name it "Nmeso site") and copy it.
2. In Netlify: **Site configuration → Environment variables → Add a variable**,
   and add these yourself (`.env.example` lists them):
   - `EMAIL_USER`: your Brevo login email, also used as the sender
   - `EMAIL_PASS`: the Brevo SMTP key
   - `YOUR_EMAIL` (optional): defaults to `omoeguare@gmail.com`
3. **Deploys → Trigger deploy → Deploy site** so the function picks them up.

Keep the key out of the repo and out of chats. If it ever leaks, delete it in Brevo
and generate a new one.

## 4. Backup notification (optional)
Netlify can also send its own plain notification:
**Forms → Form notifications → Add notification → Email notification**,
form **gift**, email `omoeguare@gmail.com`. It isn't styled, but it doesn't
depend on Brevo. Every submission is also kept under **Forms → gift**.

## 5. Test before sending her the link
1. Open the live link, go through it, and submit a test bank and account number.
2. Check omoeguare@gmail.com for "Nmeso's account details for her birthday gift"
   (look in spam and Promotions too).
3. If nothing arrives: **Logs → Functions → submission-created** shows the error.
   The usual cause is a missing or mistyped SMTP key.
4. Delete the test entry under **Forms → gift**.

Free plan limits: 100 form submissions a month on Netlify and 300 emails a day
on Brevo, both far more than this needs.
