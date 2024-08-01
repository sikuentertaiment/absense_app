const app = {
	box:find('#box'),
	table:find('#table'),
	topLayer:find('#top_layer'),
	getReqUrl(){
		return 'http://localhost:3000/dataabsense';
	},
	newKaryawanUrl(){
		return 'http://localhost:3000/addkaryawan';
	},
	editKaryawanUrl(){
		return 'http://localhost:3000/editkaryawan';
	},
	getUrlWaktuAbsensi(){
		return 'http://localhost:3000/timesconfig';
	},
	hapusDataAbsenUrl(param){
		return `http://localhost:3000/removedataabsense?id=${param}`;
	},
	updateTimeConfigUrl(){
		return 'http://localhost:3000/updatetimeconfig';
	},
	getDataKaryawanUrl(){
		return 'http://localhost:3000/datakaryawan';
	},
	deleteKaryawanUrl(param){
		return `http://localhost:3000/deletekaryawan?id=${param}`;
	},
	async init(){
		// define the height document
		this.box.style.height = `${innerHeight - 40}px`;
		this.box.style.overflow = 'auto';
		const status = await this.loadDataAbsen();
		this.normalizeData();
		const isLogin = this.checkUserLogin();
		if(!isLogin)
			return this.doLogin();
		this.showTable();
	},
	loadDataAbsen(){
		return new Promise(async (resolve,reject)=>{
			const data = await new Promise((resolve,reject)=>{
				cOn.get({url:this.getReqUrl(),onload(){
					resolve(this.getJSONResponse());
				}})
			})
			this.data = data;
			resolve(true);
		})
	},
	refreshData(){
		return new Promise(async (resolve,reject)=>{
			await this.loadDataAbsen();
			this.normalizeData();
			resolve();
		})
	},
	normalizeData(){
		const data = [];
		const posdictionary = ['id','karyawan_id','nama','divisi','date_create','time_desc','accuration'];
		for(let i=0;i<this.data.length;i++){
			const indata = [i+1];
			const item = this.data[this.data.length - (i+1)];
			posdictionary.forEach((ditem)=>{
				indata.push(item[ditem]);
			})
			data.push(indata);
		}
		this.normalized_data = data;
	},
	showTable(){
		this.table.addChild(view.table(this.normalized_data));
	},
	dblsname:'absense_db',
	checkUserLogin(){
		let data = localStorage.getItem(btoa(this.dblsname));
		if(!data)
			return false;
		data = JSON.parse(btoa(data));
		if(data.validity < new Date().getTime())
			return false;
		this.user = data;
		return true;
	},
	doLogin(){
		this.topLayer.replaceChild(view.login());
	}
}
app.init();