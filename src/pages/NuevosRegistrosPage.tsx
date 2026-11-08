import { useState } from 'react';
import { tabLabels, type Tab } from './nuevos-registros/constants';
import { TrabajadoresSection } from './nuevos-registros/TrabajadoresSection';
import { InsumosSection } from './nuevos-registros/InsumosSection';
import { EPPsSection } from './nuevos-registros/EPPsSection';
import { LineasSection } from './nuevos-registros/LineasSection';

export default function NuevosRegistrosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('trabajadores');
  const tabs: Tab[] = ['trabajadores', 'lineas', 'insumos', 'epps'];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Registros</h1>
        <p className='text-muted-foreground'>
          Gestión de registros maestros del sistema
        </p>
      </div>

      <div className='flex gap-1 border-b'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'trabajadores' && <TrabajadoresSection />}
      {activeTab === 'lineas' && <LineasSection />}
      {activeTab === 'insumos' && <InsumosSection />}
      {activeTab === 'epps' && <EPPsSection />}
    </div>
  );
}
