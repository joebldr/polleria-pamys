const mongoose = require('mongoose');

// CORRECCIÓN IMPORTANTE: Agregué '/pamysDB' en el link
const MONGO_URI = 'mongodb+srv://adminjoe:0000@cluster0.tqr12fb.mongodb.net/pamysDB?appName=Cluster0';

const ProductSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: String,
    imagen: String,
    categoria: { type: String, enum: ['promocion', 'menu'], required: true }
});
const Product = mongoose.model('Product', ProductSchema);

const productos = [
    // --- PROMOCIONES ---
    { nombre: "Paquete Mini", precio: 130, descripcion: "4 piezas surtidas + salsa especial.", imagen: "assets/4piezasfrito.jpg", categoria: "promocion" },
    { nombre: "Paquete Súper", precio: 245, descripcion: "8 piezas surtidas + papas", imagen: "assets/8piezasfrito.jpg", categoria: "promocion" },
    { nombre: "Paquete Mega", precio: 380, descripcion: "12 piezas surtidas + papas + refresco.", imagen: "assets/megaimg.jpg", categoria: "promocion" },
    { nombre: "Paquete Macro", precio: 440, descripcion: "15 pzs + papas + salsa + refresco fam.", imagen: "assets/macroimg.jpg", categoria: "promocion" },

    // --- MENÚ ---
    { nombre: "Pollo frito doble", precio: 80, descripcion: "2 piezas surtidas.", imagen: "assets/pollo-doble.jpg", categoria: "menu" },
    { nombre: "Pollo frito triple", precio: 90, descripcion: "4 piezas surtidas.", imagen: "assets/pollo-triple.jpg", categoria: "menu" },
    { nombre: "Hamburguesa", precio: 80, descripcion: "Clásica con queso.", imagen: "assets/hamburguesa.jpg", categoria: "menu" },
    { nombre: "Hamburguesa especial", precio: 95, descripcion: "Doble carne y tocino.", imagen: "assets/hamburguesa-especial.jpg", categoria: "menu" },
    { nombre: "Alitas de pollo", precio: 90, descripcion: "8 alitas (BBQ, Buffalo).", imagen: "assets/alitas.jpg", categoria: "menu" },
    { nombre: "Nuggets", precio: 90, descripcion: "8 piezas con salsas.", imagen: "assets/nuggets.jpg", categoria: "menu" },
    { nombre: "Tiras de pollo", precio: 110, descripcion: "Orden con salsas.", imagen: "assets/tiras.jpg", categoria: "menu" },
    { nombre: "Refresco", precio: 30, descripcion: "600 ml línea Coca-Cola.", imagen: "assets/refresco.jpg", categoria: "menu" }
];

async function importarDatos() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Conectado a MongoDB (pamysDB)...');

        // Borra lo que haya antes para no repetir
        await Product.deleteMany({});
        console.log('🗑️  Datos antiguos borrados.');

        // Inserta los nuevos
        await Product.insertMany(productos);
        console.log('✅ ¡Productos agregados correctamente!');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

importarDatos();