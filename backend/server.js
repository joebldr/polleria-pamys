require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <--- 1. AGREGAMOS ESTO PARA MANEJAR RUTAS

// --- 🔴 PEGA AQUÍ TU CLAVE SECRETA (SECRET KEY) 🔴 ---
// Asegúrate de que empiece con "sk_test_"
const stripe = require('stripe')(process.env.STRIPE_KEY || 'sk_test_TU_CLAVE_REAL_VA_AQUI'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- 2. SOLUCIÓN DEFINITIVA AL ERROR "Cannot GET /" ---
// Esto le dice al servidor: "Si alguien pide la raíz, dale el index.html"
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- CONEXIÓN A MONGODB ATLAS ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://adminjoe:0000@cluster0.tqr12fb.mongodb.net/pamysDB?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Base de datos Atlas conectada'))
    .catch(err => console.error('❌ Error de conexión BD:', err));

// --- MODELOS ---
const ProductSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: String,
    imagen: String,
    categoria: { type: String, enum: ['promocion', 'menu'], required: true }
});
const Product = mongoose.model('Product', ProductSchema);

// --- RUTAS API ---

// 1. Obtener productos
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// 2. Crear producto
app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// 3. Borrar producto
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// 4. Editar producto
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// --- 5. RUTA DE PAGO STRIPE ---
app.post('/api/create-checkout-session', async (req, res) => {
    console.log("💰 Recibiendo solicitud de pago con carrito:", req.body.carrito ? "OK" : "VACÍO");

    try {
        const { carrito } = req.body;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        // 3. DETECTAR EL DOMINIO AUTOMÁTICAMENTE (Para que funcione en Render y Localhost)
        const dominio = req.headers.origin; 

        const line_items = carrito.map(producto => ({
            price_data: {
                currency: 'mxn',
                product_data: {
                    name: producto.nombre,
                },
                unit_amount: Math.round(producto.precio * 100), // Stripe usa centavos
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // AQUÍ USAMOS LA VARIABLE 'dominio' EN LUGAR DE LOCALHOST FIJO
            success_url: `${dominio}/index.html?pago=exito`,
            cancel_url: `${dominio}/index.html?pago=cancelado`,
        });

        console.log("✅ Sesión creada exitosamente. URL:", session.url);
        res.json({ url: session.url });

    } catch (error) {
        console.error("❌ ERROR STRIPE:", error.message); 
        if(error.type === 'StripeAuthenticationError') {
            return res.status(500).json({ error: "Error de Clave Secreta de Stripe" });
        }
        res.status(500).json({ error: error.message });
    }
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
