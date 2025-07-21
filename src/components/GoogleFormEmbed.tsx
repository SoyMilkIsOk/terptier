import React from "react";

export default function GoogleFormEmbed() {
  return (
    <div className="w-full max-w-3xl">
      <div className="relative w-full pb-[140%] sm:pb-[75%] h-[605px] overflow-clip">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSduArqZyXU-5jl1_yXhJCbQnGw3TFDUIRX4g5ZdW8W9rhGAQw/viewform?embedded=true"
          className="absolute top-0 left-0 w-full h-[700px] border-0"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
