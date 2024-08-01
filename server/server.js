const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const formidable = require('express-formidable');
const { format,parse } = require('date-fns');

const app = express();
app.use(cors());
app.use(formidable());

// mysql config
// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'absense_db'
});

const start = async ()=>{
	const connres = await new Promise((resolve,reject)=>{
		connection.connect((err) => {
		  if (err) {
		  	return resolve(false);
		  }
		  return resolve(true);
		});
	})
	if(!connres)
		return console.log('Program stoped: Unable to connect to the db.');
	console.log('Connection Status: ok');

	// admin routes

	app.get('/admin/login',(req,res)=>{
		// route admin login
		res.send('helloworld');
	
	})

	app.post('/addkaryawan',(req,res)=>{
		handleNewKaryawan(req,res);
	})

	app.post('/editkaryawan',(req,res)=>{
		handleEditKaryawan(req,res);
	})

	app.get('/removekaryawan',(req,res)=>{
	})

	app.get('/dataabsense',(req,res)=>{
		getDataAbsense(req,res);
	})

	app.get('/removedataabsense',(req,res)=>{
		removeDataAbsense(req,res);
	})

	app.post('/updatedatabasense',(req,res)=>{

	})

	app.post('/updatetimeconfig',(req,res)=>{
		handleUpdateTimeConfig(req,res);
	})

	app.get('/timesconfig',async (req,res)=>{
		const data = await new Promise((resolve,reject)=>{
			connection.query('select * from time_config',(err,results)=>{
				if(err)
					return resolve({valid:false});
				resolve({valid:true,data:results});
			})
		})
		res.json(data);
	})

	// user routes

	app.get('/absen',(req,res)=>{
		// route for user dong absense
		doAbsense(req,res);
	})


	app.get('/getwaktu',(req,res)=>{
		// route for user dong absense
		handleGetWaktu(req,res);
	})

	app.get('/datakaryawan',async (req,res)=>{
		// route for user dong absense
		const data = await new Promise((resolve,reject)=>{
			connection.query('select * from karyawan',(err,results)=>{
				if(err)
					return resolve(false);
				resolve(results);
			})
		})
		if(!data)
			return res.json({valid:false});
		res.json({valid:true,data});
	})

	app.get('/deletekaryawan',async (req,res)=>{
		// route for user dong absense
		const data = await new Promise((resolve,reject)=>{
			connection.query(`delete from karyawan where id = ${req.query.id}`,(err,results)=>{
				if(err)
					return resolve(false);
				resolve(true);
			})
		})
		res.json({valid:data});
	})

	app.listen(3000,()=>{
		console.log('Server listening on port 3000');
	})

	const doAbsense = async (req,res)=>{
		const user_nik = req.query.nik;
		if(!user_nik || !user_nik.length){
			return res.json({valid:false,message:'Nik tidak boleh kosong!'});
		}

		const karyawan = await new Promise((resolve,reject)=>{
			connection.query(`select * from karyawan where id = "${user_nik}"`,(err,results)=>{
				if(results.length > 0)
					return resolve(results[0]);
				resolve(null);
			})
		})
		if(!karyawan)
			return res.json({valid:false,message:'Nik karyawan tidak ditemukan!'});
		
		// get time now, validating the time
		const time_validate = await validate_time();
		if(!time_validate.valid)
			return res.json({valid:false,message:'Waktu absen tidak valid!'});

		// now save the data
		const save_response = await save_absense({time_validate,user_nik});
		res.json(save_response);
	}
	const validate_time = ()=>{
		const time_now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
		const date = time_now.split(' ')[0];
		const now_tms = new Date().getTime();
		return new Promise(async (resolve,reject)=>{
			connection.query('SELECT * FROM time_config', (err, results, fields) => {
			  if (err) {
			    console.error('error querying: ' + err.stack);
			    return resolve({valid:false});
			  }
			  const status = {valid:false,time_label:null,time_now,accuration:null};
			  for(let i=0;i<results.length;i++){
			  	const item = results[i];
			  	const item_time_parsed = [
			  		parse(`${date} ${item.start_time}`,'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
			  		parse(`${date} ${item.end_time}`,'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
			  	];
			  	if(now_tms >= item_time_parsed[0] && now_tms <= item_time_parsed[1]){
			  		status.accuration = (now_tms - item_time_parsed[0]) / 1000;
			  		if(status.accuration >= 3600){
			  			status.accuration = `${Math.round(status.accuration / 3600)} Jam`;
			  		}else if(status.accuration > 60){
			  			status.accuration = `${Math.round(status.accuration / 60)} Menit`;
			  		}else{
			  			status.accuration = `${Math.round(status.accuration)} Detik`;
			  		}
			  		status.valid = true;
			  		status.time_label = item.description;
			  		break;
			  	}
			  }
			  return resolve(status);
			});

		})
	}
	const save_absense = (config)=>{
		return new Promise(async (resolve,reject)=>{
			console.log(config);
			// validating the user nik
			const karyawan = await new Promise((resolve,reject)=>{
				connection.query(`select * from karyawan where id = "${config.user_nik}"`,(err,results)=>{
					if(results.length > 0)
						return resolve(results[0]);
					resolve(null);
				})
			})
			if(!karyawan)
				return resolve({valid:false,message:'Nik karyawan tidak ditemukan!'});
			if(karyawan.status !== 'On')
				return resolve({valid:false,message:'Status user tidak aktif!'});
			
			// now really saving the absense data
			const saving_response = await new Promise((resolve,reject)=>{
				connection.query(`insert into absense (id_karyawan,date_create,accuration,time_desc) values ('${config.user_nik}','${config.time_validate.time_now}','${config.time_validate.accuration}','${config.time_validate.time_label}')`,(err)=>{
					resolve({valid:err===null,message:`Anda berhasil absen ${config.time_validate.time_label.toLowerCase()}!`,absen_time_label:config.time_validate.time_label});
				})
			})
			resolve(saving_response);
		})
	}
	const getDataAbsense = async (req,res)=>{
		const response_data = await new Promise((resolve,reject)=>{
			connection.query(`SELECT karyawan.id AS karyawan_id, karyawan.nama, absense.date_create, absense.time_desc, absense.accuration, karyawan.divisi, absense.id
      FROM absense
      JOIN karyawan ON absense.id_karyawan = karyawan.id`,(err,results)=>{
      	if(err){
      		console.error(err.stack);
      		return resolve(false);
      	}
      	resolve(results);
      })
		})
		res.json(response_data);
	}
	const handleNewKaryawan = async (req,res)=>{
		const old = await new Promise((resolve,reject)=>{
			connection.query(`select * from karyawan where id = '${req.fields.nik}'`,(err,results)=>{
				if(err ||!results.length)
					return resolve(null);
				resolve(true);
			})
		})
		if(old){
			return res.json({valid:false,message:`Karyawan dengan nik ${req.fields.nik} sudah terdaftar!`});
		}
		const response = await new Promise((resolve,reject)=>{
			connection.query(`
				insert into karyawan (id,nama,divisi,status) values ('${req.fields.nik}','${req.fields.nama}','${req.fields.divisi}','On')
			`,(err)=>{
				if(err){
					console.error(err.stack);
					return resolve(false);
				}
				resolve(true);
			})
		})
		res.json({valid:response,message:response?'Karyawan berhasil ditambahkan!':'Gagal menambahkan karyawan!'});
	}
	const handleEditKaryawan = async (req,res)=>{
		const response = await new Promise((resolve,reject)=>{
			connection.query(`
				update karyawan
				set nama = '${req.fields.nama}', divisi = '${req.fields.divisi}'
				where id = '${req.fields.nik}';
			`,(err)=>{
				if(err){
					console.error(err.stack);
					return resolve(false);
				}
				resolve(true);
			})
		})
		res.json({valid:response,message:response?'Karyawan berhasil diedit!':'Gagal mengedit data karyawan!'});
	}
	const removeDataAbsense = async (req,res)=>{
		const response = await new Promise((resolve,reject)=>{
			connection.query(`delete from absense where id = ${req.query.id}`,(err)=>{
				if(err)
					return resolve(false);
				resolve(true);
			})
		})
		res.json({valid:response});
	}
	const handleUpdateTimeConfig = async (req,res)=>{
		const data = {};
		for(let i in req.fields){
			const commands = i.split('_');
			if(!data[commands[1]])
				data[commands[1]] = {}
			data[commands[1]][`${commands[0]}_time`] = req.fields[i];
		}
		let valid = true;
		for(let i in data){
			const save = await new Promise((resolve,reject)=>{
				connection.query(`update time_config set start_time = '${data[i].start_time}', end_time = '${data[i].end_time}' where id = ${i}`,(err)=>{
					if(err)
						return resolve(false);
					resolve(true)
				})
			})
			if(!save){
				valid = false;
				break;
			}
		}
		res.json({valid});
	}
	const handleGetWaktu = async (req,res)=>{
		const time_validate = await validate_time();
		res.json(time_validate);
	}
}

start();