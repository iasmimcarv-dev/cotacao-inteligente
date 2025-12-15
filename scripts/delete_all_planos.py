import sys
sys.path.insert(0, 'C:/Users/mimid/Desktop/cotacao-assistente/backend')

from app.db.database import SessionLocal
from app.models import plano_model, faixa_preco_model, hospital_model, carencia_model, coparticipacao_model

db = SessionLocal()

try:
    print("=== Excluindo TODOS os planos do banco ===\n")
    
    # Contar total
    total_planos = db.query(plano_model.Plano).count()
    print(f"Total de planos a excluir: {total_planos}")
    
    if total_planos == 0:
        print("✅ Nenhum plano para excluir!")
        sys.exit(0)
    
    # Excluir todos os relacionamentos
    print("\n🗑️  Iniciando exclusão...")
    
    faixas_count = db.query(faixa_preco_model.FaixaPreco).delete()
    print(f"  ✅ Deletadas {faixas_count} faixas de preço")
    
    hospitais_count = db.query(hospital_model.Hospital).delete()
    print(f"  ✅ Deletados {hospitais_count} hospitais")
    
    carencias_count = db.query(carencia_model.Carencia).delete()
    print(f"  ✅ Deletadas {carencias_count} carências")
    
    coparticipacoes_count = db.query(coparticipacao_model.Coparticipacao).delete()
    print(f"  ✅ Deletadas {coparticipacoes_count} coparticipações")
    
    municipios_count = db.query(hospital_model.Municipio).delete()
    print(f"  ✅ Deletados {municipios_count} municípios")
    
    planos_count = db.query(plano_model.Plano).delete()
    print(f"  ✅ Deletados {planos_count} planos")
    
    db.commit()
    
    print("\n✅ TODOS OS PLANOS FORAM EXCLUÍDOS COM SUCESSO!")
    print(f"   - Total de planos deletados: {planos_count}")
    print(f"   - Total de faixas deletadas: {faixas_count}")
    print(f"   - Total de hospitais deletados: {hospitais_count}")
    print(f"   - Total de carências deletadas: {carencias_count}")
    print(f"   - Total de coparticipações deletadas: {coparticipacoes_count}")
    print(f"   - Total de municípios deletados: {municipios_count}")
    
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
