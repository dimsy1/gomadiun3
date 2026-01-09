import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ContentDetailDesaWisata from './components/content';
import HeaderDetail from './components/header';

function DesaWisataDetail() {
  const { id } = useParams();
  const [namaDesa, setNamaDesa] = useState('');
  const [DataDetailDesawisata, setDataDetailDesawisata] = useState(null); // Null awalnya karena satu objek

  const getData = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/${id}`);
      if (response && response.data.success && response.data.data) {
        setDataDetailDesawisata(response.data.data); // Mengambil data dari API yang benar
        setNamaDesa(response.data.data.nama_desaWisata);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }, [id]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <section className='desawisata'>
      <div className='desawisata-header my-bottom-4'>
        {/* Contoh navigasi */}
        <span className='text-white'>
          {/* <a className='text-white' href='/'>Home</a> / <a className='text-white' href='/desawisata'>Desa Wisata</a> / {namaDesa} */}
        </span>
      </div>

      {DataDetailDesawisata ? (
        <div className='d-flex flex-column'>
          <HeaderDetail DetailDesa={DataDetailDesawisata} /> {/* Data sudah benar dikirim */}
          <ContentDetailDesaWisata nama_desa={namaDesa} id={id} />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </section>
  );
}

export default DesaWisataDetail;
