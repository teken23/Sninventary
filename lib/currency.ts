
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data?.rates?.DOP || 58.5;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 58.5;
  }
}
