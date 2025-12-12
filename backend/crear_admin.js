const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// TU CONEXIÓN (La misma que usamos antes)
const MONGO_URI = 'mongodb+srv://adminjoe:0000@cluster0.tqr12fb.mongodb.net/pamysDB?appName=Cluster0';

// El modelo de usuario (Copiado de server.js)
const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', UserSchema);

async function crearAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Conectado a MongoDB...');

        // 1. Datos del nuevo administrador
        const emailAdmin = "admin@pamys.com";
        const passwordPlana = "pollo123"; // <--- ESTA SERÁ LA CONTRASEÑA PARA ENTRAR

        // 2. Borramos si ya existía para no duplicar
        await User.findOneAndDelete({ email: emailAdmin });
        console.log('🧹 Usuario antiguo limpiado (si existía)...');

        // 3. Encriptamos la contraseña (Seguridad obligatoria)
        const hashedPassword = await bcrypt.hash(passwordPlana, 10);

        // 4. Creamos el usuario
        await User.create({
            nombre: "Dueño Pamy",
            email: emailAdmin,
            password: hashedPassword,
            role: "admin" // IMPORTANTE: Le damos permisos de jefe
        });

        console.log('✅ ¡ADMINISTRADOR CREADO EXITOSAMENTE!');
        console.log('📧 Correo: ' + emailAdmin);
        console.log('🔑 Clave:  ' + passwordPlana);
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

crearAdmin();