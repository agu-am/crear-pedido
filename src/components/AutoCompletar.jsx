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
    return (
      <span style={{ display: 'block', textAlign: 'center' }}>{item.name}</span>
    )
  }

  return (
    <div className='w-full py-2 px-2 flex flex-col justify-center self-center rounded-md xl:w-6/12 col-start-1 col-end-2 row-start-1 row-end-2'>
      <h2 className='font-bold uppercase'>Ingresar Cliente:</h2>
      <ReactSearchAutocomplete
        items={clientes}
        onSearch={handleOnSearch}
        onSelect={handleOnSelect}
        autoFocus={false}
        inputSearchString={clienteInputSearch}
        onClear={handleLimpiarCliente}
        formatResult={formatResult}
        showIcon={true}
        styling={{
          height: "34px",
          borderRadius: "4px",
          backgroundColor: "white",
          boxShadow: "none",
          fontSize: "16px",
          placeholderColor: "darkgreen",
          clearIconMargin: "3px 8px 0 0",
          zIndex: 2,
          fontWigth: "bold",
        }}
      />
    </div>
  )
}

export default SearchAutoCompletar
