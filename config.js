/* Add your Supabase Project URL and publishable/anon key here. Never put a service_role key in this public repository. */
window.BARAEM_CONFIG = {
  supabaseUrl: "https://jhykcwrosmhauasvgdvz.supabase.co",
  supabaseAnonKey: "sb_publishable_zPWHBWXlEErn-fLTMA26gQ_Q6853nML"
};

window.getBaraemSupabase = function () {
  const config = window.BARAEM_CONFIG || {};
  if (!window.supabase || !config.supabaseUrl || !config.supabaseAnonKey ||
      config.supabaseUrl.indexOf("PASTE_") === 0 || config.supabaseAnonKey.indexOf("PASTE_") === 0) {
    return null;
  }
  if (!window.__baraemSupabase) {
    window.__baraemSupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
  return window.__baraemSupabase;
};
