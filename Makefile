-include .env
export

# Derivados de DEPLOY_TARGET (user@host:caminho)
_DEPLOY_HOST = $(firstword $(subst :, ,$(DEPLOY_TARGET)))
_DEPLOY_PATH = $(patsubst %/,%,$(word 2,$(subst :, ,$(DEPLOY_TARGET))))
_BACKUP_PATH = $(_DEPLOY_PATH).bak

deploy:
	@test -n "$(DEPLOY_TARGET)" || (echo "Erro: DEPLOY_TARGET não definido. Exemplo: make deploy DEPLOY_TARGET=user@host:~/node_projects/adriano/Lottery" && exit 1)
	@echo "→ Backup: $(_DEPLOY_HOST):$(_BACKUP_PATH)"
	ssh $(_DEPLOY_HOST) "[ -d '$(_DEPLOY_PATH)' ] && rsync -a --delete '$(_DEPLOY_PATH)/' '$(_BACKUP_PATH)/' || true"
	rsync -avz --delete \
		--exclude='.env' \
		--exclude='node_modules/' \
		--exclude='lottery.db' \
		--exclude='lottery.db-shm' \
		--exclude='lottery.db-wal' \
		--exclude='public/table.pdf' \
		--exclude='.DS_Store' \
		. $(_DEPLOY_HOST):$(_DEPLOY_PATH)/
	@echo "→ Instalando dependências e reiniciando serviço..."
	ssh $(_DEPLOY_HOST) "cd '$(_DEPLOY_PATH)' && npm install --omit=dev && (pm2 restart lottery 2>/dev/null || pm2 start index.js --name lottery)"
	@echo "→ Deploy concluído. Rollback disponível com: make rollback"

rollback:
	@test -n "$(DEPLOY_TARGET)" || (echo "Erro: DEPLOY_TARGET não definido." && exit 1)
	ssh $(_DEPLOY_HOST) "[ -d '$(_BACKUP_PATH)' ] || (echo 'Erro: nenhum backup disponível em $(_BACKUP_PATH)' && exit 1)"
	@echo "→ Restaurando $(_BACKUP_PATH) → $(_DEPLOY_PATH)"
	ssh $(_DEPLOY_HOST) "rsync -a --delete '$(_BACKUP_PATH)/' '$(_DEPLOY_PATH)/' && (pm2 restart lottery 2>/dev/null || true)"
	@echo "→ Rollback concluído."
