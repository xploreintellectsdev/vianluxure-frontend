"use client";
const WhoWeAre = ({ data }) => {
  if (!data) return null;

  return (
    <section className="w-full bg-[#eeeeee] py-16 px-4 md:px-6">
      <div className="max-w-7xl">
        <h2 className="text-slate-500 tracking-wide text-xl font-semibold mb-5">
          {data.eyebrow_label}
        </h2>
        <div 
          className="text-slate-700 text-xl leading-loose"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      </div>
    </section>
  );
};

export default WhoWeAre;