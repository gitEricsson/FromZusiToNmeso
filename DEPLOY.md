# Deploying From Zusi to Nmeso (free)

The site deploys from GitHub so Netlify also builds the email function.
Dragging the folder onto Netlify Drop would publish the page, but the gift form
would fail, because Drop doesn't deploy functions.

## 1. Connect the repo
1. Log in at https://app.netlify.com (a free account is fine).
2. **Add new site → Import an existing project → GitHub**, then pick
   `gitEricsson/FromZusiToNmeso`.
3. Leave the build command empty. The publish directory (`site`) and the
   functions folder are read from `netlify.toml`. Click **Deploy**.
4. Optional: **Site configuration → Change site name** to `fromzusitonmeso`,
   so the link becomes `https://fromzusitonmeso.netlify.app`.

Every push to `main` redeploys the site automatically.

## 2. Let the function send the email
The form posts to `/.netlify/functions/send-gift`, which emails the details
through Brevo's SMTP relay (the same setup as the Proposal site) to
omoeguare@gmail.com only.

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

## 3. Test before sending her the link
1. Open the live link, go through it, and submit a test bank and account number.
2. Check omoeguare@gmail.com for "Nmeso's account details for her birthday gift"
   (look in spam and Promotions too).
3. If the page says "that didn't send", open **Logs → Functions → send-gift**
   in Netlify. The error there says what went wrong:
   - `Email is not configured`: an environment variable is missing, or the site
     wasn't redeployed after adding it.
   - `Failed to send email`: Brevo rejected the login. Check the SMTP key, and that
     `EMAIL_USER` matches your Brevo login.
   - No `send-gift` function listed at all: the site was deployed without functions
     (for example via Netlify Drop). Deploy from GitHub as in step 1.

Brevo's free plan sends 300 emails a day, far more than this needs.
