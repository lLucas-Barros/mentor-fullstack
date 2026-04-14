export default function ProjectPage({ params }: { params: { id: string } }) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#555]">Projeto {params.id}</p>
        </div>
      </div>
    )
  }