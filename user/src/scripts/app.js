const app = {
	absenbutton:find('#absen'),
	nik:find('#nik'),
	topLayer:find('#top_layer'),
	baseurl:'http://localhost',
	port:'3000',
	getBaseUrl(){
		return `${this.baseurl}:${this.port}`;
	},
	getUrl(route){
		return `${this.getBaseUrl()}${route}`;
	},
	olddataabsense:{},
	init(){
		this.loadOldNik();
		this.loadDataAbsense();
		this.absenseButtonInit();
	},
	loadDataAbsense(){
		const nik = localStorage.getItem(btoa('old_data_absense')) || null;
		if(nik)
			this.olddataabsense = JSON.parse(atob(nik));
		console.log(this.olddataabsense);
	},
	loadOldNik(){
		const nik = localStorage.getItem(btoa('nik_karyawan')) || null;
		if(nik)
			this.nik.value = atob(nik);
	},
	saveNikData(){
		localStorage.setItem(btoa('nik_karyawan'),btoa(this.nik.value));
	},
	absenseButtonInit(){
		this.absenbutton.onclick = ()=>{
			this.doAbsense();
		}
	},
	async doAbsense(){
		this.topLayer.show('block');
		if(!this.nik.value.length){
			this.topLayer.hide();
			return Swal.fire({
			  icon: "error",
			  title: "Oops...",
			  text: "Nik tidak boleh kosong!"
			});
		}
		const time_now = await this.getWaktu();
		if(time_now.valid){
			const nowday = new Date().toLocaleDateString();
			if(this.olddataabsense[nowday]){
				if(this.olddataabsense[nowday][`${time_now.time_label}_${this.nik.value}`]){
					this.topLayer.hide();
					return Swal.fire({
						icon:'error',
						title:'Gagal',
						text:`Anda sudah absen ${time_now.time_label.toLowerCase()}!`
					})
				}
			}
		}
		this.saveNikData();
		const absense = await this.absense(this.nik.value);
		this.saveOldDataAbsense(absense.absen_time_label,this.nik.value);
		this.topLayer.hide();
		return Swal.fire({
			icon:absense.valid ? 'success' : 'error',
			title:absense.valid ? 'Success' : 'Opps',
			text:absense.message
		})
	},
	absense(nik){
		return new Promise((resolve,reject)=>{
			cOn.get({url:this.getUrl(`/absen?nik=${nik}`),onload(){
				const response = this.getJSONResponse();
				resolve(response);
			}})
		})
	},
	saveOldDataAbsense(param,nik){
		const nowday = new Date().toLocaleDateString();
		if(!this.olddataabsense[nowday]){
			this.olddataabsense[nowday] = {};
		}
		if(!param)
			return
		this.olddataabsense[nowday][`${param}_${nik}`] = true;
		localStorage.setItem(btoa('old_data_absense'),btoa(JSON.stringify(this.olddataabsense)));
	},
	getWaktu(){
		return new Promise((resolve,reject)=>{
			cOn.get({
				url:app.getUrl('/getwaktu'),
				onload(){
					resolve(this.getJSONResponse());
				}
			})
		})
	}
}
app.init();