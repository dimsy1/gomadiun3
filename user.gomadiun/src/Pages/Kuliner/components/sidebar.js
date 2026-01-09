import { React, useState } from 'react';


function SidebarDesawissata() {
    const min = 75000;
    const max = 350000;
    const initial = (min + max) / 2;

    const [value, setValue] = useState(initial);

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <div className="sidebar-desawisata">
                <span className='fw-bold'>Temukan tempat kuliner Anda</span>
                <div className="form-group py-3">
                    <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Cari" />
                </div>
            </div>
            {/* <div className="sidebar-desawisata my-4">   
                <span className='fw-bold'>Harga Murah?</span>
                <div className="form-group py-3">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleChange}
                        aria-describedby="rangeHelp" />
                </div>
            </div> */}
            <div className="sidebar-desawisata-rating my-4">
                <span className='fw-bold'>Rating</span>
                <div className='py-3'>
                    <div className="form-group d-flex flex-row">
                        <input type="checkbox" id="vehicle1" name="vehicle1" value="5" />
                        <div className='mx-2 text-warning'>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div className="form-group d-flex flex-row">
                        <input type="checkbox" id="vehicle1" name="vehicle1" value="4" />
                        <div className='mx-2 text-warning'>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div className="form-group d-flex flex-row">
                        <input type="checkbox" id="vehicle1" name="vehicle1" value="3" />
                        <div className='mx-2 text-warning'>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div className="form-group d-flex flex-row">
                        <input type="checkbox" id="vehicle1" name="vehicle1" value="2" />
                        <div className='mx-2 text-warning'>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div className="form-group d-flex flex-row">
                        <input type="checkbox" id="vehicle1" name="vehicle1" value="1" />
                        <div className='mx-2 text-warning'>
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SidebarDesawissata;
