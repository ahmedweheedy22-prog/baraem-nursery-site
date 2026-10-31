(() => {
  const $ = (s) => document.querySelector(s);
  const putText = (selector, key, values, firstText = false) => {
    const el = $(selector); const value = values[key];
    if (!el || typeof value !== 'string') return;
    if (firstText && el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) el.firstChild.textContent = value;
    else el.textContent = value;
  };
  document.addEventListener('DOMContentLoaded', async function () {
    const menu = $('.menu'), links = $('.links');
    if (menu && links) {
      menu.addEventListener('click', () => links.classList.toggle('open'));
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
    }
    const client = window.getBaraemSupabase && window.getBaraemSupabase();
    if (!client) return;
    try {
      const result = await client.from('site_content').select('key,value').eq('is_public', true);
      if (result.error) throw result.error;
      const values = Object.fromEntries((result.data || []).map(row => [row.key, row.value]));
      document.querySelectorAll('[data-content]').forEach(node => {
        const value = values[node.dataset.content]; if (typeof value === 'string') node.textContent = value;
      });
      document.querySelectorAll('[data-image]').forEach(node => {
        const value = values[node.dataset.image];
        try { if (value && new URL(value).protocol === 'https:') node.src = value; } catch (_) {}
      });
      const texts = [
        ['.topbar','announcement',false],['.topbar b','announcement_highlight',false],
        ['header .brand span:last-child','brand_name',true],['header .brand small','brand_tagline',false],
        ['.links a:nth-child(1)','nav_about',false],['.links a:nth-child(2)','nav_program',false],['.links a:nth-child(3)','nav_day',false],['.links a:nth-child(4)','nav_gallery',false],['.links a:nth-child(5)','nav_reviews',false],['.links a:nth-child(6)','nav_contact',false],['.nav-cta','nav_cta',true],
        ['.hero-copy .eyebrow','hero_eyebrow',false],['.hero-actions .btn','hero_button',true],['.hero-actions .btn-light','hero_secondary',true],['.trust b','trust_title',false],['.visual-note','hero_image_caption',true],['.visual-note small','hero_image_subcaption',false],['.float-card span','hero_card_text',false],
        ['#about .section-head .eyebrow','features_eyebrow',false],['#about h2','features_title',false],['#about .section-head p','features_intro',false],
        ['.cards .card:nth-child(1) .icon','feature1_icon',false],['.cards .card:nth-child(1) h3','feature1_title',false],['.cards .card:nth-child(1) p','feature1_text',false],['.cards .card:nth-child(2) .icon','feature2_icon',false],['.cards .card:nth-child(2) h3','feature2_title',false],['.cards .card:nth-child(2) p','feature2_text',false],['.cards .card:nth-child(3) .icon','feature3_icon',false],['.cards .card:nth-child(3) h3','feature3_title',false],['.cards .card:nth-child(3) p','feature3_text',false],
        ['#program .approach-pic .pic-label','program_caption',false],['#program .approach-copy .eyebrow','program_eyebrow',false],['#program .ticks li:nth-child(1)','program_point1',true],['#program .ticks li:nth-child(2)','program_point2',true],['#program .ticks li:nth-child(3)','program_point3',true],['#program .approach-copy .btn','program_button',true],
        ['#gallery .section-head .eyebrow','gallery_eyebrow',false],['#gallery h2','gallery_title',false],['#gallery .section-head p','gallery_text',false],
        ['#day .section-head .eyebrow','day_eyebrow',false],['#day h2','day_title',false],['#day .section-head p','day_intro',false],
        ...[1,2,3,4].flatMap(n => [[`.day-item:nth-child(${n}) b`,`day${n}_eyebrow`,false],[`.day-item:nth-child(${n}) h3`,`day${n}_title`,false],[`.day-item:nth-child(${n}) p`,`day${n}_text`,false]]),
        ['.stars','review_stars',false],['.quote cite','review_attribution',true],['.visit-box h2','contact_title',false],['.visit-box p','contact_text',false],['#whatsapp-link','whatsapp_button',true],
        ['.inquiry-form h3','form_title',false],['.inquiry-form label:nth-of-type(1)','form_name_label',true],['.inquiry-form label:nth-of-type(2)','form_phone_label',true],['.inquiry-form label:nth-of-type(3)','form_message_label',true],['.privacy-note','privacy_note',false],['.inquiry-form button','form_button',false],
        ['footer .footer-brand .brand span:last-child','brand_name',true],['footer .footer-brand .brand small','brand_tagline',false],['.footer-brand>p','footer_intro',false],['.footer-col:nth-child(2) h3','footer_col1_title',false],['.footer-col:nth-child(2) a:nth-child(1)','footer_col1_link1',true],['.footer-col:nth-child(2) a:nth-child(2)','footer_col1_link2',true],['.footer-col:nth-child(2) a:nth-child(3)','footer_col1_link3',true],['.footer-col:nth-child(3) h3','footer_col2_title',false],['.footer-col:nth-child(3) a:nth-child(1)','footer_col2_link1',true],['.footer-col:nth-child(3) a:nth-child(2)','footer_col2_link2',true],['.footer-col:nth-child(3) a:nth-child(3)','footer_col2_link3',true],['.footer-col:nth-child(4) h3','footer_col3_title',false],['.copyright span:first-child','copyright_text',false],['.copyright span:last-child','footer_credit',false]
      ];
      texts.forEach(([selector,key,firstText]) => putText(selector,key,values,firstText));
      const wideBanner=$('#wide-banner'),wideImage=$('#wide-banner img');
      if(wideBanner&&wideImage){const url=values.wide_banner_image||'';try{if(url&&new URL(url).protocol==='https:'){wideImage.src=url;wideImage.alt=values.wide_banner_alt||'لقطة من حضانة براعم';wideBanner.hidden=false;}else wideBanner.hidden=true;}catch(_){wideBanner.hidden=true;}}
      const gallery=$('#gallery'),galleryGrid=$('#gallery-grid');
      if(gallery&&galleryGrid){galleryGrid.replaceChildren();let shown=0;for(let n=1;n<=6;n++){const url=values['gallery_image'+n];try{if(!url||new URL(url).protocol!=='https:')continue;const figure=document.createElement('figure'),img=document.createElement('img');img.src=url;img.alt='صورة من حضانة براعم — '+n;img.loading='lazy';figure.appendChild(img);galleryGrid.appendChild(figure);shown++;}catch(_){}}gallery.hidden=false;const empty=$('#gallery-empty');if(empty)empty.hidden=shown>0;}
      const trustText=$('.trust>span:last-child'); if(trustText && values.trust_text){trustText.replaceChildren();if(values.trust_title){const b=document.createElement('b');b.textContent=values.trust_title;trustText.appendChild(b);}trustText.append(document.createElement('br'),document.createTextNode(values.trust_text));}
      if(values.logo_image){document.querySelectorAll('.brand .logo').forEach(box=>{box.replaceChildren();const img=document.createElement('img');img.src=values.logo_image;img.alt=values.brand_name||'شعار الحضانة';img.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:inherit';box.appendChild(img);});}
      [['.hero-img img','hero_alt'],['.approach-pic img','program_alt']].forEach(([selector,key])=>{const img=$(selector);if(img&&values[key])img.alt=values[key];});
      const social=$('.social');
      const socialLinks=[['instagram_url','ig','إنستغرام'],['facebook_url','f','فيسبوك'],['tiktok_url','♪','تيك توك'],['youtube_url','▶','يوتيوب']];
      if(social){social.replaceChildren();socialLinks.forEach(([key,label,name])=>{if(values[key]){const a=document.createElement('a');a.href=values[key];a.target='_blank';a.rel='noopener';a.textContent=label;a.setAttribute('aria-label',name);social.appendChild(a);}})}
      if (values.favicon_image) { let icon=$('link[rel="icon"]'); if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);} icon.href=values.favicon_image; }
      if (values.meta_description) { const meta=$('meta[name="description"]'); if(meta) meta.content=values.meta_description; }
      if (values.page_title) document.title=values.page_title;
      const wa=$('#whatsapp-link');
      if (wa && values.whatsapp) { const number=values.whatsapp.replace(/\D/g,''); if(number){ const url='https://wa.me/'+number+'?text='+encodeURIComponent('مرحباً، حابة أحجز زيارة لحضانة براعم');wa.href=url;const floating=$('#floating-whatsapp');if(floating)floating.href=url; } }
      if (values.phone_display) { const phone=$('[data-phone-link]');if(phone)phone.href='tel:'+values.phone_display.replace(/[^0-9+]/g,''); }
      if (values.email) { const email=$('[data-email-link]');if(email)email.href='mailto:'+values.email; }
      const form=$('#inquiry-form');
      if(form) form.addEventListener('submit',async event=>{event.preventDefault();const status=$('#form-status'),data=new FormData(form);status.textContent='جارٍ إرسال الاستفسار…';status.classList.remove('error');const saved=await client.from('enquiries').insert({parent_name:String(data.get('parent_name')||'').trim(),phone:String(data.get('phone')||'').trim(),message:String(data.get('message')||'').trim()});if(saved.error){status.textContent='ما قدرناش نبعت الاستفسار دلوقتي. حاولي تاني أو كلمينا على واتساب.';status.classList.add('error');return;}form.reset();status.textContent='وصلنا استفسارك، هنكلمك قريبًا. شكرًا لك!';});
    } catch (error) { console.error('تعذر تحميل محتوى براعم من قاعدة البيانات.', error); }
  });
})();
