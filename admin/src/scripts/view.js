const view = {
	table(data_){
		return makeElement('div',{
			id:'cutable',
			innerHTML:`
				<div style=display:flex;align-items:space-between;justify-content:center;margin-bottom:15px;flex-direction:column;>
					<div style=display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;>
						<div style=font-weight:bold;font-size:24px;>DATA ABSENSI KARYAWAN</div>
						<div style="width:32px;height:32px;cursor:pointer;">
							<img src=./src/media/user.png style=width:100%;object-fit:contain;>
						</div>
					</div>
					<div style="display:flex;gap:5px;justify-content:space-between;">
						<div style=display:flex;gap:5px;>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=refreshbutton class=child>
								<img src=./src/media/refresh.png width=16>
								PERBARUI DATA
							</button>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=time_config class=child>
								<img src=./src/media/time_config.png width=16>
								KONFIG WAKTU
							</button>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=daftarkaryawan class=child>
								<img src=./src/media/stats.png width=16>
								PRESENSI
							</button>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=tambahkaryawan class=child>
								<img src=./src/media/group.png width=18>
								TAMBAH KARYAWAN
							</button>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=karyawan class=child>
								<img src=./src/media/group.png width=18>
								KARYAWAN
							</button>
							<button style="font-weight:bold;display:flex;align-items:flex-end;gap:5px;cursor:pointer;" id=choosedate class=child>
								<img src=./src/media/calendar.png width=18>
								PILIH TANGGAL
							</button>
						</div>
						<div>
							<div style=display:flex;align-items:center;gap:5px;>
								<div style=width:24px;margin-right:10px;>
									<img src=./src/media/search.png style=width:100%;>
								</div>
								<div style=display:flex;>
									<input placeholder="Cari table..." id=search_value>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div id=header>
					<div style=max-width:32px;min-width:32px; id=headernumber>NO</div>
					<div>NIK KARYAWAN</div>
					<div>NAMA</div>
					<div>DIVISI</div>
					<div>TANGGAL</div>
					<div>WAKTU</div>
					<div>LABEL WAKTU</div>
					<div>KETERLAMBATAN</div>
					<div style="border-right:1px solid gainsboro;">TINDAKAN</div>
				</div>
				<div id=body>

				</div>
			`,
			autoDefine:true,
			onadded(){
				this.generateBody(this.filterByTime(data_));
				this.initFinder();
				this.initDateFilter();
				this.initAddKaryawan();
				this.initRefreshData();
				this.initConfigWaktu();
				this.initDaftarKaryawan();
				this.initListKaryawan();
				app[this.id] = this;
			},
			generateBody(data_param=null){
				const headerNomber = this.headernumber.offsetWidth;
				const data = data_param ? data_param : data_;
				for(let i=0;i<data.length;i++){
					const item = data[i];
					this.body.addChild(makeElement('div',{
						style:`
							display:flex;
							background:${(i % 2 !== 0)?'whitesmoke':'white'};
							min-height:48px;
						`,
						autoDefine:true,
						data:item,
						innerHTML:`
							<div style=max-width:${headerNomber}px;min-width:${headerNomber}px;justify-content:center;>${i+1}.</div>
							<div style=width:100%;overflow:hidden;>${item[2]}</div>
							<div style=width:100%;overflow:hidden;>${item[3]}</div>
							<div style=width:100%;overflow:hidden;>${item[4]}</div>
							<div style=width:100%;overflow:hidden;>${item[5].split(' ')[0]}</div>
							<div style=width:100%;overflow:hidden;>${item[5].split(' ')[1]}</div>
							<div style="width:100%;overflow:hidden;">${item[6]}</div>
							<div style="width:100%;overflow:hidden;">${item[7]}</div>
							<div style="width:100%;gap:5px;justify-content:center;padding:10px 0;flex-direction:column;">
								<button class=child id=delete style=display:flex;align-items:center;gap:5px;padding:8px;width:80%;justify-content:center;>
									<img src=./src/media/delete.png width=16>
									HAPUS
								</button>
								<button class=child id=detail style=display:flex;align-items:center;gap:5px;padding:8px;width:80%;justify-content:center;>
									<img src=./src/media/details.png width=16>
									DETAIL</button>
							</div>
						`,
						onadded(){
							this.delete.onclick = async ()=>{
								const confirm = await Swal.fire({
								  title: "Are you sure?",
								  text: "You won't be able to revert this!",
								  icon: "warning",
								  showCancelButton: true,
								  confirmButtonColor: "#3085d6",
								  cancelButtonColor: "#d33",
								  confirmButtonText: "Yes, delete it!"
								});
								if(confirm.isConfirmed)
									this.deleteData();
							}
							this.detail.onclick = ()=>{
								app.topLayer.addChild(view.absenseDetails(this.data));
							}
						},
						async deleteData(){
							const response = await new Promise((resolve,reject)=>{
								cOn.get({
									url:app.hapusDataAbsenUrl(this.data[1]),
									onload(){
										resolve(this.getJSONResponse());
									}
								})
							})
							await app.refreshData();
							app.cutable.body.clear();
							app.cutable.generateBody(app.cutable.filterByTime(app.normalized_data));
							data_ = app.normalized_data;
							Swal.fire({
								icon:response.valid?'success':'error',
								title:response.valid?'Berhasil':'Gagal',
								text:response.valid?'Data berhasil dihapus!':'Gagal menghapus data!'
							})
						}
					}))
				}
				if(!data.length)
					this.body.addChild(makeElement('div',{
						innerHTML:'Data tidak ditemukan!',
						style:'margin-top:20px;text-align:center;'
					}))
			},
			initFinder(){
				this.search_value.onchange = ()=>{
					const data_s = data_.filter((item)=>item.toString().indexOf(this.search_value.value) !== -1);
					this.body.clear();
					this.generateBody(data_s);
				}
			},
			initAddKaryawan(){
				this.tambahkaryawan.onclick = ()=>{
					app.topLayer.addChild(view.addKaryawan(this));
				}
			},
			initRefreshData(){
				this.refreshbutton.onclick = async ()=>{
					await app.refreshData();
					date_ = app.normalized_data;
					this.body.clear();
					this.generateBody(this.filterByTime(date_));
					Swal.fire({
						icon:'success',
						title:'Berhasil',
						text:'Data berhasil diperbarui!'
					})
				}
			},
			initDateFilter(){
				this.choosedate.onclick = ()=>{
					this.showDateChooser();
				}
			},
			showDateChooser(){
				app.topLayer.addChild(view.chooseDate(this));
			},
			processChoosedDate(param){
				this.body.clear();
				this.generateBody(this.filterByTime(data_,param));
			},
			filterByTime(data,date){
				const date_ = new Date();
				let date_end;
				if(!date){
					date = `${date_.getFullYear()}-${(date_.getMonth() + 1) < 10 ? '0'+(date_.getMonth() + 1) : (date_.getMonth() + 1)}-${date_.getDate()} 00:00:00`;
					date_end = `${date_.getFullYear()}-${(date_.getMonth() + 1) < 10 ? '0'+(date_.getMonth() + 1) : (date_.getMonth() + 1)}-${date_.getDate()} 23:59:59`;
				}else{
					date_end = date + ` 23:59:59`;
					date += ` 00:00:00`;
				}
				return data.filter((item)=>(new Date(item[5]).getTime() >= new Date(date).getTime() && new Date(item[5]).getTime() <= new Date(date_end).getTime()));
			},
			processAddKaryawan(data){
				console.log(data);
			},
			initConfigWaktu(){
				this.time_config.onclick = ()=>{
					app.topLayer.addChild(view.configWaktu());
				}
			},
			initDaftarKaryawan(){
				this.daftarkaryawan.onclick = ()=>{
					app.topLayer.addChild(view.daftarKaryawan());
				}
			},
			initListKaryawan(){
				this.karyawan.onclick = ()=>{
					app.topLayer.replaceChild(view.listKaryawan(this));
				}
			}
		})
	},
	chooseDate(parent){
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style=margin-bottom:10px;font-weight:bold;>PILIH TANGGAL</div>
					<div style="display:flex;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;">
						<input type=date id=date style=width:100%;>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=process style=width:100%;>PILIH</button>
						<button class=child id=cancel style=width:100%;>BATAL</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.process.onclick = ()=>{
					if(!this.date.value.length)
						return Swal.fire({
						  icon: "error",
						  title: "Oops...",
						  text: "Pilih tanggal dengan benar!"
						});
					app.topLayer.hide();
					parent.processChoosedDate(this.date.value);
					this.remove();
				}
			}
		})
	},
	addKaryawan(){
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style=margin-bottom:10px;font-weight:bold;>LENGKAPI DATA KARYAWAN!</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NIK</div>
						<div style=display:flex;>
							<input placeholder="Masukan NIK Karyawan" style=width:100% id=nik>
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NAMA</div>
						<div style=display:flex;>
							<input placeholder="Masukan NAMA Karyawan" style=width:100% id=nama>
						</div>
					</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;">
						<div style=margin-bottom:5px;>DIVISI</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divisi>
						</div>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=process style=width:100%;>SIMPAN</button>
						<button class=child id=cancel style=width:100%;>BATAL</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.process.onclick = async ()=>{
					const data = {};
					let inValid = null;
					this.findall('input').forEach((input)=>{
						if(!input.value.length && !inValid)
							inValid = input.id.toUpperCase();
						data[input.id] = input.value;
					})
					if(inValid)
						return Swal.fire({
						  icon: "error",
						  title: "Oops...",
						  text: `${inValid} tidak boleh kosong!`
						});
					const response = await new Promise((resolve,reject)=>{
						cOn.post({
							url:app.newKaryawanUrl(),
							data:JSON.stringify(data),
							someSettings:[['setRequestHeader','content-type','application/json']],
							onload(){
								resolve(this.getJSONResponse())
							}
						})
					})
					Swal.fire({
						icon:response.valid?'success':'error',
						title:response.valid?'Success':'Opps',
						text:response.message
					})
					app.topLayer.hide();
					this.remove();
				}
			}
		})
	},
	absenseDetails(data){
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style=margin-bottom:10px;font-weight:bold;>DETAILS ABSEN</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NIK</div>
						<div style=display:flex;>
							<input placeholder="Masukan NIK Karyawan" style=width:100% id=nik readonly value="${data[2]}">
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NAMA</div>
						<div style=display:flex;>
							<input placeholder="Masukan NAMA Karyawan" style=width:100% id=nama readonly value="${data[3]}">
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>DIVI</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divi readonly value="${data[4]}">
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>WAKTU ABSEN</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divi readonly value="${data[5]}">
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>LABEL WAKTU</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divi readonly value="${data[6]}">
						</div>
					</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;">
						<div style=margin-bottom:5px;>KETERLAMBATAN</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divisi readonly value="${data[7]}">
						</div>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=cancel style=width:100%;>TUTUP</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
			}
		})
	},
	configWaktu(){
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style=margin-bottom:20px;font-weight:bold;>KONFIGURASI WAKTU ABSEN</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;" id=databody>
						<div style=font-size:11px;>MEMUAT DATA WAKTU ABSENSI...</div>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=process style=width:100%;>SIMPAN</button>
						<button class=child id=cancel style=width:100%;>TUTUP</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.process.onclick = ()=>{
					this.saveData();
				}
				this.getWaktuAbsensi();
			},
			async getWaktuAbsensi(){
				const data = await new Promise((resolve,reject)=>{
					cOn.get({
						url:app.getUrlWaktuAbsensi(),
						onload(){
							resolve(this.getJSONResponse());
						}
					})
				})
				if(!data.valid)
					return Swal.fire({
						icon:'error',
						title:'Gagal',
						text:'Gagal mendapatkan data!'
					})
				this.data = data.data;
				this.generateData();
			},
			generateData(){
				this.databody.clear();
				this.data.forEach((item)=>{
					this.databody.addChild(makeElement('div',{
						style:'margin-bottom:20px;border-top:1px solid gainsboro;padding-top:20px;',
						innerHTML:`
							<div style=margin-bottom:5px;>
								<div style=margin-bottom:5px;>Label</div>
								<div style=display:flex;>
									<input value="${item.description}" style=width:100%; readonly>
								</div>
							</div>
							<div style=display:flex;gap:2px;>
								<div style=width:100%;>
									<div style=margin-bottom:5px;>Start</div>
									<div style=display:flex;>
										<input type=time id=start_${item.id} value="${item.start_time}" style=width:100%;>
									</div>
								</div>
								<div style=width:100%;>
									<div style=margin-bottom:5px;>End</div>
									<div style=display:flex;>
										<input type=time id=end_${item.id} value="${item.end_time}" style=width:100%;>
									</div>
								</div>
							</div>
						`
					}))
				})
			},
			async saveData(){
				const data = {};
				this.findall('input').forEach(input=>{
					if(input.id.length)
						data[input.id] = input.value;
				})
				const response = await new Promise((resolve,reject)=>{
					cOn.post({
						url:app.updateTimeConfigUrl(),
						someSettings:[['setRequestHeader','content-type','application/json']],
						data:JSON.stringify(data),
						onload(){
							resolve(this.getJSONResponse());
						}
					})
				})
				Swal.fire({
					icon:response.valid?'success':'error',
					title:response.valid?'Berhasil':'Gagal',
					text:response.valid?'Data berhasil disimpan!':'Gagal menyimpan data!'
				})
				app.topLayer.hide();
				this.remove();
			}
		})
	},
	daftarKaryawan(){
		// working on init dates
		const date = new Date();
		const month = date.getMonth()+1;
		let start_date = `${date.getFullYear()}-${month < 10 ? '0'+month : month}-01`;
		let end_date = `${date.getFullYear()}-${month < 10 ? '0'+month : month}-${date.getDate()} 23:59:59`;
		let days_gap = new Date(end_date).getTime() - new Date(start_date).getTime();
		days_gap = (days_gap/1000)/(3600*24);
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style="padding-bottom:20px;margin-bottom:20px;font-weight:bold;border-bottom:1px solid gainsboro;">PRESENSI KARYAWAN</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;" id=databody>
						<div style=margin-bottom:5px;>
								<div style=margin-bottom:5px;font-weight:bold;>FILTER TANGGAL</div>
							</div>
							<div style=display:flex;gap:2px;>
								<div style=width:100%;>
									<div style=margin-bottom:5px;>Start</div>
									<div style=display:flex;>
										<input type=date id=start_ style=width:100%; value="${start_date}">
									</div>
								</div>
								<div style=width:100%;>
									<div style=margin-bottom:5px;>End</div>
									<div style=display:flex;>
										<input type=date id=end_ style=width:100%; value="${end_date}">
									</div>
								</div>
							</div>
							<div style=display:flex;margin-top:10px;>
								<button style=width:100%; class=child id=process_data>LOAD DATA</button>
							</div>
					</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;" id=databody>
						<div style=margin-bottom:5px;>
							<div style=margin-bottom:5px;font-weight:bold;>DAFTAR KARYAWAN</div>
						</div>
						<div style=height:300px;overflow:auto;>
							<div style="display:flex;gap:1px;border-bottom:1px solid gainsboro;margin-bottom:10px;background:whitesmoke;">
								<div style=width:100%;height:100%;display:flex;align-items:center;padding:10px;>NAMA</div>
								<div style=width:100%;height:100%;display:flex;align-items:center;padding:10px;>PERSENTASE</div>
							</div>
							<div id=box_name>
								<div style=display:flex;gap:1px;>
									
								</div>
							</div>
						</div>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=cancel style=width:100%;>TUTUP</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.process_data.onclick = ()=>{
					days_gap = ((this.processDate(`${this.end_.value} 23:00:00`).getTime() - this.processDate(this.start_.value).getTime())/1000)/(3600*24);
					start_date = this.start_.value;
					end_date = this.end_.value;
					console.log(days_gap,start_date,end_date);
					this.data_stats = this.getDataStats(this.data_karyawan);
					this.normalizeData();
					this.displayData();
				}
				this.generateStats();
			},
			processDate(string){
				return new Date(string);
			},
			async generateStats(){
				// getting karyawans data
				const karyawan = await new Promise((resolve,reject)=>{
					cOn.get({
						url:app.getDataKaryawanUrl(),
						onload(){
							resolve(this.getJSONResponse());
						}
					})
				})
				if(!karyawan.valid)
					return Swal.fire({
						icon:'error',
						title:'Gagal',
						text:'Gagal memuat data karyawan!'
					})
				this.data_karyawan = karyawan.data;
				this.data_stats = this.getDataStats(this.data_karyawan);
				this.normalizeData();
				this.getPercentageDataStats();
				this.displayData();
			},
			getDataStats(data_){
				const data = {};
				data_.forEach((item)=>{
					data[item.id] = {
						name:item.nama,
						stats:{pagi:0,siang:0,sore:0},
						overall:null
					}
				})
				return data;
			},
			getPercentageDataStats(){
				// no working on stats percentile
				for(let i in this.data_stats){
					const item = this.data_stats[i];
					// console.log(item.stats.sore);
					for(let time_label in item.stats){
						const percentage = Number(String(this.data_stats[i].stats[time_label] / days_gap).slice(0,4)) * 100;
						// console.log(time_label,data[i].stats[time_label],percentage,days_gap);
						this.data_stats[i].stats[time_label] = percentage;
					}
				}
				console.log(this.data_stats);
			},
			normalizeData(){
				app.normalized_data.forEach((item)=>{
					const id = item[2];
					const time_label = item[6].toLowerCase();
					const tms = this.processDate(item[5]).getTime();
					if(tms >= this.processDate(start_date).getTime() && tms <= this.processDate(end_date).getTime()){
						this.data_stats[id].overall += 1;
						if(!this.data_stats[id].stats[time_label])
							this.data_stats[id].stats[time_label] = 0;
						this.data_stats[id].stats[time_label] += 1;
					}
				})
			},
			getSortedData(){
				let data = [];
				for(let i in this.data_stats){
					data.push(this.data_stats[i]);
				}
				data = data.sort((a,b)=>{
					if(a.overall === b.overall)
						return 0
					else if(a.overall > b.overall)
						return -1;
					else
						return 1;
				})
				return data;
			},
			displayData(){
				this.box_name.clear();
				// knowing the array data, it must be sorted
				const sorted = this.getSortedData();
				sorted.forEach((item)=>{
					this.box_name.addChild(makeElement('div',{
						style:'border-bottom:1px solid gainsboro',
						innerHTML:`
							<div style=display:flex;gap:1px;>
								<div style=width:100%;height:100%;display:flex;align-items:center;padding:5px 10px;>${item.name}</div>
								<div style="width:100%;height:100%;display:flex;align-items:center;padding:5px 10px;justify-content:space-between;">
									<div>
										${Math.round((item.overall / (days_gap * 3)) * 100)}%
									</div>
									<div style=width:16px;height:16px;cursor:pointer; id=expand>
										<img src=./src/media/details.png width=100% height=100%>
									</div>
								</div>
							</div>
							<div style="font-size:11px;display:flex;padding:10px 5px;background:whitesmoke;display:none;" id=detailsdata>
								<div style=width:100%;>Pagi: ${item.stats.pagi ? item.stats.pagi : 0}%</div>
								<div style=width:100%;>Siang: ${item.stats.siang ? item.stats.siang : 0}%</div>
								<div style=width:100%;>Sore: ${item.stats.sore ? item.stats.sore : 0}%</div>
							</div>
						`,
						autoDefine:true,
						state:false,
						onadded(){
							this.expand.onclick = ()=>{
								if(!this.state){
									this.detailsdata.show('flex');
									this.state = true;
									return
								}
								this.detailsdata.hide();
								this.state = false;
							}
						}
					}))
				})
				if(!sorted.length)
					this.box_name.addChild(makeElement('div',{
						innerHTML:'Data tidak ditemukan!',
						style:'text-align:center;padding:20px;'
					}))
			}
		})
	},
	listKaryawan(oldparent){
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:100%;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
					height:100%;
					display:flex;
					flex-direction:column;
				">
					<div style="padding:20px;font-weight:bold;border-bottom:1px solid gainsboro;display:flex;justify-content:space-between;align-items:center;">
						<div>DAFTAR KARYAWAN</div>
						<div style=display:flex;gap:10px;align-items:center;>
							<img src=./src/media/search.png width=16px>
							<input placeholder="Telusuri data karyawan..." id=finder>
						</div>
					</div>
					<div id=bodytable style=height:100%;display:flex;flex-direction:column;>
						<div id=header style=display:flex;min-height:32px;background:whitesmoke;align-items:center;padding:15px>
							<div style=max-width:100px;min-width:100px;>NO</div>
							<div style=width:100%;>NIK</div>
							<div style=width:100%;>NAMA</div>
							<div style=width:100%;>DIVISI</div>
							<div style=width:100%;>TINDAKAN</div>
						</div>
						<div style=height:100%;padding:15px id=body>
							<div style=>
								
							</div>
						</div>
					</div>
					<div style=display:flex;gap:5px;padding:10px;>
						<button class=child id=cancel style=width:100%;>TUTUP</button>
					</div>
				</div>
			`,
			autoDefine:true,
			async onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.finder.onchange = ()=>{
					this.displayData(this.finder.value);
				}
				this.data = await this.loadDataKaryawan();
				if(!this.data.valid)
					return Swal.fire({
						icon:'error',
						title:'Gagal',
						text:'Gagal meload data karyawan!'
					})
				this.displayData();
			},
			loadDataKaryawan(){
				return new Promise((resolve,reject)=>{
					cOn.get({
						url:app.getDataKaryawanUrl(),
						onload(){
							resolve(this.getJSONResponse());
						}
					})
				})
			},
			displayData(findervalue=null){
				this.body.clear();
				let putin = 0;
				this.data.data.forEach((item,i)=>{
					if(findervalue){
						let found = false;
						for(let i in item){
							if(item[i].toLowerCase().indexOf(findervalue.toLowerCase())!==-1){
								found = true
							}
						}
						if(!found)
							return
					}
					putin += 1;
					this.body.addChild(makeElement('div',{
						style:`display:flex;min-height:32px;background:${i%2?'whitesmoke':'white'};align-items:center;`,
						innerHTML:`
							<div style=max-width:100px;min-width:100px;>${i+1}.</div>
							<div style=width:100%;>${item.id}</div>
							<div style=width:100%;>${item.nama}</div>
							<div style=width:100%;>${item.divisi}</div>
							<div style="width:100%;gap:5px;justify-content:center;padding:10px 0;display:flex;">
								<button class=child id=delete style=display:flex;align-items:center;gap:5px;padding:8px;width:80%;justify-content:center;>
									<img src=./src/media/delete.png width=16>
									HAPUS
								</button>
								<button class=child id=edit style=display:flex;align-items:center;gap:5px;padding:8px;width:80%;justify-content:center;>
									<img src=./src/media/details.png width=16>
									EDIT</button>
							</div>
						`,
						data:item,
						autoDefine:true,
						onadded(){
							this.delete.onclick = ()=>{
								this.delete_();
							}
							this.edit.onclick = ()=>{
								this.edit_();
							}
						},
						edit_(){
							app.topLayer.replaceChild(view.editkaryawan(this.data));
						},
						async delete_(){
							const confirm = await Swal.fire({
							  title: "Are you sure?",
							  text: "You won't be able to revert this!",
							  icon: "warning",
							  showCancelButton: true,
							  confirmButtonColor: "#3085d6",
							  cancelButtonColor: "#d33",
							  confirmButtonText: "Yes, delete it!"
							});
							if(confirm.isConfirmed)
								this.deleteData();
						},
						async deleteData(){
							const response = await new Promise((resolve,reject)=>{
								cOn.get({
									url:app.deleteKaryawanUrl(this.data.id),
									onload(){
										resolve(this.getJSONResponse())
									}
								})
							})
							Swal.fire({
								icon:response.valid?'success':'error',
								title:response.valid?'Berhasil':'Gagal',
								text:response.valid?'Data berhasil dihapus':'Gagal menghapus data!'
							})
							if(response.valid){
								app.topLayer.replaceChild(view.listKaryawan());
							}
						}
					}))
				})
				if(!putin){
					this.body.addChild(makeElement('div',{
						style:'text-align:center;padding:20px;',
						innerHTML:'Data tidak ditemukan!'
					}))
				}
			}
		})
	},
	editkaryawan(data){
		console.log(data);
		return makeElement('div',{
			style:`
				width:100%;height:100%;display:flex;justify-content:center;align-items:flex-start;
			`,
			innerHTML:`
				<div style="
					width:40%;
					padding:25px;
					background:white;
					border:1px solid gainsboro;
					border-top:0;
				">
					<div style=margin-bottom:10px;font-weight:bold;>EDIT DATA KARYAWAN!</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NIK</div>
						<div style=display:flex;>
							<input placeholder="Masukan NIK Karyawan" style=width:100% id=nik value="${data.id}" readonly>
						</div>
					</div>
					<div style=margin-bottom:10px;>
						<div style=margin-bottom:5px;>NAMA</div>
						<div style=display:flex;>
							<input placeholder="Masukan NAMA Karyawan" style=width:100% id=nama value="${data.nama}">
						</div>
					</div>
					<div style="margin-bottom:10px;padding-bottom:20px;border-bottom:1px solid gainsboro;margin-bottom:20px;">
						<div style=margin-bottom:5px;>DIVISI</div>
						<div style=display:flex;>
							<input placeholder="Masukan DIVISI Karyawan" style=width:100% id=divisi value="${data.divisi}">
						</div>
					</div>
					<div style=display:flex;gap:5px;>
						<button class=child id=process style=width:100%;>SIMPAN</button>
						<button class=child id=cancel style=width:100%;>BATAL</button>
					</div>
				</div>
			`,
			autoDefine:true,
			onadded(){
				app.topLayer.show();
				this.cancel.onclick = ()=>{
					app.topLayer.replaceChild(view.listKaryawan());
				}
				this.process.onclick = async ()=>{
					const data = {};
					let inValid = null;
					this.findall('input').forEach((input)=>{
						if(!input.value.length && !inValid)
							inValid = input.id.toUpperCase();
						data[input.id] = input.value;
					})
					if(inValid)
						return Swal.fire({
						  icon: "error",
						  title: "Oops...",
						  text: `${inValid} tidak boleh kosong!`
						});
					const response = await new Promise((resolve,reject)=>{
						cOn.post({
							url:app.editKaryawanUrl(),
							data:JSON.stringify(data),
							someSettings:[['setRequestHeader','content-type','application/json']],
							onload(){
								resolve(this.getJSONResponse())
							}
						})
					})
					Swal.fire({
						icon:response.valid?'success':'error',
						title:response.valid?'Success':'Opps',
						text:response.message
					})
					app.topLayer.replaceChild(view.listKaryawan());
				}
			}
		})
	}
}