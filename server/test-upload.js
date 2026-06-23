async function test() {
  const form = new FormData();
  form.append('resume', new Blob(['dummy pdf content'], { type: 'application/pdf' }), 'test.pdf');
  form.append('category', 'Software Development and Engineering');
  form.append('role', 'Frontend Developer');

  try {
    const res = await fetch('http://localhost:5000/api/analyze/standard', {
      method: 'POST',
      body: form,
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
