import axios from 'axios';

async function test() {
  try {
    const resCategories = await axios.get('http://127.0.0.1:5001/api/categories');
    console.log('--- /api/categories ---');
    console.log('Count:', resCategories.data.data.length);
    console.log('Sample:', resCategories.data.data.map(c => ({ value: c.value, label: c.label, image: c.image })));

    const resProCategories = await axios.get('http://127.0.0.1:5001/api/professionals/categories');
    console.log('\n--- /api/professionals/categories ---');
    console.log('Categories:', resProCategories.data.data);

    const resPros = await axios.get('http://127.0.0.1:5001/api/professionals');
    console.log('\n--- /api/professionals ---');
    console.log('Count:', resPros.data.data.length);
    console.log('Categories of returned pros:', resPros.data.data.map(p => p.serviceCategory));

  } catch (err) {
    console.error('API Error:', err.message);
  }
}

test();
