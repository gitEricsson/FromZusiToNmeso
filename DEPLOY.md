# Deploying Nmeso's birthday site (free)

## 1. Put it online
1. Go to https://app.netlify.com/drop and log in (a free account is fine).
2. Drag the whole `FromZusiToNmeso` folder onto the page.
3. Netlify gives you a link like `https://random-name-123.netlify.app`.
4. Optional: Site configuration → Change site name → e.g. `fromzusitonmeso`
   so the link becomes `https://fromzusitonmeso.netlify.app`.

## 2. Turn on form detection (one time)
1. In the site dashboard open **Forms**.
2. If it says form detection is off, click **Enable form detection**.
3. **Redeploy** so Netlify can see the form: drag the folder onto
   Deploys → "Drag and drop your site output folder here" again.
4. A form called **gift** should now be listed under Forms.

## 3. Email the bank details to omoeguare@gmail.com
1. Forms → **Form notifications** → Add notification → **Email notification**.
2. Event: *New form submission*. Form: **gift**.
3. Email to notify: `omoeguare@gmail.com` → Save.

Every submission is also saved under Forms → gift in the dashboard, so nothing
gets lost even if the email lands in spam. (The free plan allows 100
submissions a month.)

## 4. Test before sending her the link
Open the live link, go through it, and submit a test bank/account number.
Check that the email reaches omoeguare@gmail.com (look in spam/Promotions too),
then delete the test entry under Forms → gift → the submission → Delete.
