document.addEventListener('DOMContentLoaded', async function () {
  var client = window.getBaraemSupabase && window.getBaraemSupabase();
  var loginPanel = document.getElementById('login-panel');
  var dashboard = document.getElementById('dashboard');
  var loginStatus = document.getElementById('login-status');
  if (!client) { loginStatus.textContent = 'أضيفي بيانات مشروع Supabase في assets/js/config.js أولًا.'; loginStatus.classList.add('error'); return; }

  var fields = [
    ['hero_line1','العنوان الرئيسي — السطر الأول','text'],['hero_highlight','العنوان الرئيسي — الكلمة المميزة','text'],['hero_text','وصف البانر','textarea'],
    ['hero_image','صورة البانر','url'],['program_title','عنوان قسم البرنامج','text'],['program_text','وصف قسم البرنامج','textarea'],
    ['program_image','صورة قسم البرنامج','url'],['whatsapp','رقم واتساب مع كود الدولة، بدون +','text'],
    ['phone_display','رقم الهاتف الظاهر للزوار','text'],['address','عنوان الحضانة','text'],['email','البريد الإلكتروني','email'],
    ['review_text','نص رأي ولي الأمر','textarea'],['review_name','اسم صاحب/ة الرأي','text']
  ];
  function setStatus(id, text, error) { var el=document.getElementById(id); el.textContent=text; el.classList.toggle('error',!!error); }
  function escapeText(value) { return String(value || '').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  async function showDashboard() {
    loginPanel.hidden = true; dashboard.hidden = false;
    var loaded = await client.from('site_content').select('key,value').order('key');
    if (loaded.error) { setStatus('content-status','تعذر تحميل المحتوى: '+loaded.error.message,true); return; }
    var values=Object.fromEntries((loaded.data||[]).map(function(x){return [x.key,x.value]}));
    var form=document.getElementById('content-form'); form.replaceChildren();
    fields.forEach(function(field){
      var label=document.createElement('label'); label.textContent=field[1];
      var input=field[2]==='textarea'?document.createElement('textarea'):document.createElement('input');
      if(field[2]!=='textarea') input.type=field[2]; input.name=field[0]; input.value=values[field[0]]||'';
      label.appendChild(input);
      if(field[0]==='hero_image'||field[0]==='program_image'){
        var upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp,image/avif';upload.setAttribute('aria-label','رفع صورة');
        var uploadStatus=document.createElement('small');
        upload.addEventListener('change',async function(){
          var file=upload.files&&upload.files[0];if(!file)return;
          if(file.size>50*1024*1024){uploadStatus.textContent='حجم الصورة أكبر من 50 ميجابايت.';return;}
          uploadStatus.textContent='جارٍ رفع الصورة…';
          var safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
          var path=field[0]+'/'+Date.now()+'-'+safeName;
          var uploaded=await client.storage.from('baraem-media').upload(path,file,{upsert:false,contentType:file.type});
          if(uploaded.error){uploadStatus.textContent='تعذر الرفع: '+uploaded.error.message;return;}
          input.value=client.storage.from('baraem-media').getPublicUrl(path).data.publicUrl;
          uploadStatus.textContent='تم رفع الصورة. احفظي التغييرات لتظهر على الموقع.';
        });
        label.appendChild(upload);label.appendChild(uploadStatus);
      }
      form.appendChild(label);
    });
    await loadEnquiries();
  }
  async function loadEnquiries() {
    var host=document.getElementById('enquiries-list'); host.replaceChildren();
    var result=await client.from('enquiries').select('id,parent_name,phone,message,status,created_at').order('created_at',{ascending:false}).limit(100);
    if(result.error){host.textContent='تعذر تحميل الاستفسارات: '+result.error.message;return;}
    if(!result.data.length){host.textContent='لا توجد استفسارات حتى الآن.';host.className='enquiries-list empty-state';return;}
    result.data.forEach(function(item){
      var card=document.createElement('article');card.className='enquiry';
      var body=document.createElement('div');var title=document.createElement('strong');title.textContent=item.parent_name+' · '+item.phone;
      var msg=document.createElement('p');msg.textContent=item.message;var date=document.createElement('small');date.textContent=new Date(item.created_at).toLocaleString('ar-EG');
      body.append(title,msg,date);card.appendChild(body);
      if(item.status!=='done'){var button=document.createElement('button');button.type='button';button.textContent='تم التواصل';button.addEventListener('click',async function(){var u=await client.from('enquiries').update({status:'done'}).eq('id',item.id);if(!u.error)loadEnquiries();});card.appendChild(button);}else{var badge=document.createElement('small');badge.textContent='تم التواصل';card.appendChild(badge);}
      host.appendChild(card);
    });
  }

  var session=await client.auth.getSession(); if(session.data.session) await showDashboard();
  client.auth.onAuthStateChange(function(event,session){if(session){showDashboard();}else{dashboard.hidden=true;loginPanel.hidden=false;}});
  document.getElementById('login-form').addEventListener('submit',async function(event){
    event.preventDefault();var data=new FormData(event.currentTarget);setStatus('login-status','جارٍ تسجيل الدخول…');
    var result=await client.auth.signInWithPassword({email:String(data.get('email')),password:String(data.get('password'))});
    if(result.error){setStatus('login-status','تعذر تسجيل الدخول. راجعي البريد وكلمة المرور.',true);return;}event.currentTarget.reset();
  });
  document.getElementById('logout').addEventListener('click',async function(){await client.auth.signOut();});
  document.getElementById('content-form').addEventListener('submit',async function(event){
    event.preventDefault();var data=new FormData(event.currentTarget);var rows=[];
    fields.forEach(function(field){rows.push({key:field[0],value:String(data.get(field[0])||'').trim(),is_public:true});});
    setStatus('content-status','جارٍ حفظ التغييرات…');var saved=await client.from('site_content').upsert(rows,{onConflict:'key'});
    if(saved.error){setStatus('content-status','تعذر الحفظ: '+saved.error.message,true);return;}setStatus('content-status','اتحفظت التغييرات بنجاح.');
  });
});
