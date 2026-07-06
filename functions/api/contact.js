export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const {
    name = '',
    email = '',
    tel = '',
    subject = '',
    message = '',
    privacyAgree = false,
    botField = '',
  } = payload || {};

  if (botField) {
    return jsonResponse({ ok: true }, 200);
  }

  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return jsonResponse({ error: 'Missing required fields.' }, 400);
  }

  if (!privacyAgree) {
    return jsonResponse({ error: 'Privacy consent is required.' }, 400);
  }

  if (!env.EMAIL) {
    return jsonResponse({ error: 'Missing EMAIL binding.' }, 500);
  }

  if (!env.CONTACT_TO || !env.CONTACT_FROM) {
    return jsonResponse({ error: 'Missing CONTACT_TO or CONTACT_FROM.' }, 500);
  }

  const mail = new EmailMessage(
    env.CONTACT_FROM,
    env.CONTACT_TO,
    buildMessage({
      name: name.trim(),
      email: email.trim(),
      tel: tel.trim(),
      subject: subject.trim(),
      message: message.trim(),
      contactTo: env.CONTACT_TO,
    }),
  );

  try {
    await env.EMAIL.send(mail);
    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to send email.', details: String(error) },
      500,
    );
  }
}

function buildMessage({ name, email, tel, subject, message, contactTo }) {
  return `From: ${escapeHeader(name)} <${email}>
To: ${contactTo}
Subject: [art.k お問い合わせ] ${escapeHeader(subject)}
Reply-To: ${email}
Content-Type: text/plain; charset=UTF-8

お名前: ${name}
メールアドレス: ${email}
電話番号: ${tel || '未入力'}
お問い合わせ項目: ${subject}

お問い合わせ内容:
${message}
`;
}

function escapeHeader(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}
