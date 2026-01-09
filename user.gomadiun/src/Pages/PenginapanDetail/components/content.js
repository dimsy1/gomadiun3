import { React, useState, useEffect } from 'react';
import Modal from '../../../modal/modalImages';
import air_condicioner from "../../assets/img/air_conditioner.png";
import restaurant from "../../assets/img/restaurant.png";
import wifi from "../../assets/img/wifi.png";
import parking from "../../assets/img/parking.png";
import lift from "../../assets/img/lift.png";
import swim from "../../assets/img/swim.png";
import Resepsionis from "../../assets/img/reception.png";

function ContentDetailDesaWisata({ DetailPenginapan }) {
  const [showExtraImages, setShowExtraImages] = useState(false);

  useEffect(() => {
    console.log('DetailPenginapan:', DetailPenginapan);
  }, [DetailPenginapan]);

  const handleShowMoreImages = () => setShowExtraImages(true);
  const handleCloseModal = () => setShowExtraImages(false);

  return (
    <div className="cover-detail-penginapan my-top-2">
      <div id="gallery" className="photos-grid-container gallery">
        <div className="main-photo">
          <img src={DetailPenginapan[0].imageUrl} alt="Sampul Penginapan" />
        </div>
        
        <div>
          <div className="sub">
            {DetailPenginapan[0].gallery.slice(1, 4).map((image, index) => (
              <div key={index} className="img-box">
                <img src={image} alt={`Ruang Penginapan ${index + 1}`} />
              </div>
            ))}
            
            {/* Gambar keempat dengan tulisan "Lihat semua" */}
            {DetailPenginapan[0].gallery[4] && (
              <div id="multi-link" className="img-box" onClick={handleShowMoreImages}>
                <img src={DetailPenginapan[0].gallery[4]} alt="Ruang Penginapan 4" />
                <div className="transparent-box">
                  <div className="caption">Lihat semua</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mengirim seluruh galeri ke modal untuk ditampilkan */}
        <Modal 
          show={showExtraImages} 
          onClose={handleCloseModal} 
          images={DetailPenginapan[0].gallery} 
        />
      </div>

      {/* <div className="card-random w-100 my-5 p-4 rounded-10 flex-column"> */}
        <div className="d-flex flex-row">
          <span className="mx-1 mt-5 text-bold text-size-18">Fasilitas Utama</span>
        </div>
        <div className="container-fasilitas">
          {DetailPenginapan[0].fasilitas_utama?.length > 0 ? (
            DetailPenginapan[0].fasilitas_utama.map((item, index) => (
              <div key={index} className="item-fasilitas">
                {item.fasilitas === "Air Conditioner" && (
                  <div>
                    <img src={air_condicioner} width={25} alt="AC" />
                    <span className="mx-2">AC</span>
                  </div>
                )}
                {item.fasilitas === "Restoran" && (
                  <div>
                    <img src={restaurant} width={25} alt="Restoran" />
                    <span className="mx-2">Restoran</span>
                  </div>
                )}
                {item.fasilitas === "Wifi" && (
                  <div>
                    <img src={wifi} width={25} alt="Wifi" />
                    <span className="mx-2">Wifi</span>
                  </div>
                )}
                {item.fasilitas === "Lift" && (
                  <div>
                    <img src={lift} width={25} alt="Lift" />
                    <span className="mx-2">Lift</span>
                  </div>
                )}
                {item.fasilitas === "Gym" && (
                  <div>
                    <i className="fa-solid fa-dumbbell"></i>
                    <span className="mx-2">Pusat Kebugaran</span>
                  </div>
                )}
                {item.fasilitas === "Parkiran" && (
                  <div>
                    <img src={parking} width={25} alt="Parkiran" />
                    <span className="mx-2">Parkiran</span>
                  </div>
                )}
                {item.fasilitas === "Kolam Renang" && (
                  <div>
                    <img src={swim} width={25} alt="Kolam Renang" />
                    <span className="mx-2">Kolam Renang</span>
                  </div>
                )}
                {item.fasilitas === "Resepionis 24 Jam" && (
                  <div>
                    <img src={Resepsionis} width={25} alt="Resepsionis 24 Jam" />
                    <span className="mx-2">Resepsionis 24 Jam</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>Tidak ada fasilitas yang tersedia</div>
          )}
        </div>
      </div>
    // </div>
  );
}

export default ContentDetailDesaWisata;
