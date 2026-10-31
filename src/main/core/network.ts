import dns from 'dns';

export async function isNetworkAvailable(timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, timeoutMs);

    dns.lookup('accounts.google.com', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(!err);
      }
    });
  });
}
