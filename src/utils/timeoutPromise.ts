const timeoutPromise = (seconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), seconds * 1000);
  });

export default timeoutPromise;
