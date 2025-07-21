import React from "react";

export default function GoogleFormEmbed() {
  return (
    <div className="w-full max-w-3xl">
      <div className="relative w-full pb-[140%] sm:pb-[75%]">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdJ57qne5G3v4bUKvRx45AkYtozhePrKwtYkS1agTZeZG9nkg/viewform?embedded=true"
          className="absolute top-0 left-0 w-full h-full border-0"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
