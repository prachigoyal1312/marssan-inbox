const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  try {
    console.log("Function started");

    const supabase = createClient(
      "https://pdglfbjwawzdyhzbefyp.supabase.co",
      "sb_secret_u3oemzEJMR_U1phMwtIbBw_QY37QLSo"
    );

    console.log("Client created");

    const { data, error } = await supabase
      .from("messages")
      .select("*");

    console.log("Query result:", { data, error });

    if (error) {
      return res.status(500).json({
        step: "query",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      messages: data,
    });

  } catch (err) {
    console.error("Catch error:", err);
    return res.status(500).json({
      step: "catch",
      error: err.message,
    });
  }
};
