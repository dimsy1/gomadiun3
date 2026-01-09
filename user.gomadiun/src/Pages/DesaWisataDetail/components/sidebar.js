import { React, useEffect, useState } from 'react';


function SidebarDesawissata() {

    return (
        <div className="sidebar-desawisata">
            <span className='fw-bold'>Temukan desa wisata tujuanmu</span>
            <div class="form-group py-3">
                <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Cari" />
            </div>
        </div>
    );
}

export default SidebarDesawissata;
