export async function deleteBlob(url: string) {
  try {
    await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.error('Failed to delete blob', err);
  }
}
