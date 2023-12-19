
const getDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

export default (tag: string) => {
  return {
    info: (...args: any[]) =>
      console.log(`${getDate()} INFO [${tag}]`, ...args),
    warn: (...args: any[]) =>
      console.log(`${getDate()} WARN [${tag}]`, ...args),
    error: (...args: any[]) =>
      console.log(`${getDate()} ERROR [${tag}]`, ...args),
  };
};
