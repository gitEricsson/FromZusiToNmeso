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
The email goes out from a Gmail account you control, to omoeguare@gmail.com.

1. On that Gmail account, turn on 2-Step Verification
   (Google Account → Security).
2. Create an app password at https://myaccount.google.com/apppasswords
   (name it "Nmeso site"). Google shows a 16-character password once.
3. In Netlify: **Site configuration → Environment variables → Add a variable**,
   and add these yourself:
   - `GMAIL_USER`: the Gmail address you're sending from
   - `GMAIL_APP_PASSWORD`: the 16-character app password
   - `NOTIFY_TO` (optional): defaults to `omoeguare@gmail.com`
4. **Deploys → Trigger deploy → Deploy site** so the function picks them up.

## 4. Backup notification (optional)
Netlify can also send its own plain notification:
**Forms → Form notifications → Add notification → Email notification**,
form **gift**, email `omoeguare@gmail.com`. It isn't styled, but it doesn't
depend on Gmail. Every submission is also kept under **Forms → gift**.

## 5. Test before sending her the link
1. Open the live link, go through it, and submit a test bank and account number.
2. Check omoeguare@gmail.com for "Nmeso's account details for her birthday gift"
   (look in spam and Promotions too).
3. If nothing arrives: **Logs → Functions → submission-created** shows the error.
   The usual cause is a missing or mistyped app password.
4. Delete the test entry under **Forms → gift**.

Free plan limits: 100 form submissions a month, and Gmail sends up to
500 emails a day, so both are far more than this needs.
