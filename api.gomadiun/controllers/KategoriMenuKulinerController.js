const db = require('../models');
const tbl_Kategori_menu = db.tbl_Kategori_menu;

const get_all_kategori_menu_byKuliner = async (req, res) => {
  try {
    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }
    
    // Ambil data dan kelompokkan berdasarkan nama_kategori_menu
    const data = await tbl_Kategori_menu.findAll({
      where: { id_kuliner },
      attributes: ['id_kategori_menu', 'nama_kategori_menu'], // hanya ambil kolom yang dibutuhkan
    });

    if (data.length === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    // Kelompokkan id_kategori_menu berdasarkan nama_kategori_menu
    const groupedData = data.reduce((result, item) => {
      const { nama_kategori_menu, id_kategori_menu } = item;

      // Jika nama_kategori_menu belum ada dalam result, tambahkan dengan array kosong
      if (!result[nama_kategori_menu]) {
        result[nama_kategori_menu] = [];
      }

      // Tambahkan id_kategori_menu ke dalam array kategori yang sesuai
      result[nama_kategori_menu].push(id_kategori_menu);

      return result;
    }, {});

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: Object.keys(groupedData).map(nama_kategori_menu => ({
        nama_kategori_menu,
        id_kategori_menu: groupedData[nama_kategori_menu]
      })),
    };

    res.status(200).json(result);

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};

module.exports = {
  get_all_kategori_menu_byKuliner
};
