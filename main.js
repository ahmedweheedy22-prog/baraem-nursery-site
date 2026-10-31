document.addEventListener('DOMContentLoaded', async function () {
  var menu = document.querySelector('.menu');
  var links = document.querySelector('.links');
  if (menu && links) {
    menu.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { links.classList.remove('open'); }); });
  }

  var client = window.getBaraemSupabase && window.getBaraemSupabase();
  if (!client) return;

  try {
    var result = await client.from('site_content').select('key,value').eq('is_public', true);
    if (result.error) throw result.error;
    var values = Object.fromEntries((result.data || []).map(function (row) { return [row.key, row.value]; }));
    document.querySelectorAll('[data-content]').forEach(function (node) {
      var value = values[node.dataset.content];
      if (typeof value === 'string') node.textContent = value;
    });
    document.querySelectorAll('[data-image]').forEach(function (node) {
      var value = values[node.dataset.image];
      try { if (value && new URL(value).protocol === 'https:') node.src = value; } catch (_) {}
    });
    var wa = document.getElementById('whatsapp-link');
    if (wa && values.whatsapp) {
      var number = values.whatsapp.replace(/\D/g, '');
      if (number) {
        var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent('مرحباً، حابة أحجز زيارة لحضانة براعم');
        wa.href = url;
        var floating = document.getElementById('floating-whatsapp');
        if (floating) floating.href = url;
      }
    }
    if (values.phone_display) { var phone=document.querySelector('[data-phone-link]'); if(phone) phone.href='tel:'+values.phone_display.replace(/[^0-9+]/g,''); }
    if (values.email) { var email=document.querySelector('[data-email-link]'); if(email) email.href='mailto:'+values.email; }
  } catch (error) { console.error('تعذر تحميل محتوى براعم من قاعدة البيانات.', error); }

  var form = document.getElementById('inquiry-form');
  if (form) form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var status = document.getElementById('form-status');
    var data = new FormData(form);
    status.textContent = 'جارٍ إرسال الاستفسار…';
    status.classList.remove('error');
    var saved = await client.from('enquiries').insert({
      parent_name: String(data.get('parent_name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      message: String(data.get('message') || '').trim()
    });
    if (saved.error) {
      status.textContent = 'ما قدرناش نبعت الاستفسار دلوقتي. حاولي تاني أو كلمينا على واتساب.';
      status.classList.add('error');
      return;
    }
    form.reset();
    status.textContent = 'وصلنا استفسارك، هنكلمك قريبًا. شكرًا لك!';
  });
});
