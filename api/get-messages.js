const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://pdglfbjwawzdyhzbefyp.supabase.co",
  "sb_secret_u3oemzEJMR_U1phMwtIbBw_QY37QLSo"
);

module.exports = async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ messages: data });
  } catch (err) {
    return res.status(500).json({ error: "Server failed" });
  }
};
