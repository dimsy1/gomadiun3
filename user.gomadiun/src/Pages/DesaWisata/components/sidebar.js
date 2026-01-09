import { React } from 'react';


function SidebarDesawissata({ setkeyword, value }) {
    const handleInputChange = (event) => {
        setkeyword(event.target.value);
    };
    return (
        <div className="sidebar-desawisata">
            <span className='fw-bold'>Temukan desa wisata tujuanmu</span>
            <div className="form-group py-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Cari"
                    value={value}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
}

export default SidebarDesawissata;
