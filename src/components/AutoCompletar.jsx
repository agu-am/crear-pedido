import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import usePedido from '../hooks/usePedido'

const SearchAutoCompletar = () => {

  const { clientes, setBusquedaCliente, setPedido, setValidarCliente, clienteInputSearch } = usePedido()

  const handleOnSearch = (string) => {
    setBusquedaCliente(string)
  }

  const handleOnSelect = (item) => {
    setValidarCliente(false)
    setPedido((prevPedido) => ({
      ...prevPedido, cliente: item
    }))
  }

  const handleLimpiarCliente = () => {
    setValidarCliente(false)
    setPedido((prevPedido) => ({
      ...prevPedido, cliente: ""
    }))
  }

  const formatResult = (item) => {
    const local = item.local ? `, ${item.local}` : "";
    return (
      <span className="block px-2 py-1.5 text-left text-sm text-ink">
        {item.codigo_interno ? (
          <><strong className="font-semibold">{item.codigo_interno}</strong> - </>
        ) : null}
        {item.razon_social}{local}
      </span>
    )
  }

  return (
    <div className="w-full">
      <ReactSearchAutocomplete
        items={clientes}
        onSearch={handleOnSearch}
        onSelect={handleOnSelect}
        autoFocus={false}
        inputSearchString={clienteInputSearch}
        onClear={handleLimpiarCliente}
        formatResult={formatResult}
        placeholder="Buscar cliente..."
        showIcon={true}
        styling={{
          height: "44px",
          borderRadius: "12px",
          border: "1px solid #0e0f0c",
          backgroundColor: "#ffffff",
          boxShadow: "none",
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
          placeholderColor: "#868685",
          iconColor: "#0e0f0c",
          color: "#0e0f0c",
          hoverBackgroundColor: "#e8ebe6",
          zIndex: 50,
          clearIconMargin: "3px 8px 0 0",
        }}
      />
    </div>
  )
}

export default SearchAutoCompletar
