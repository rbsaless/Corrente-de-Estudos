# Arquitetura Corrente de Estudos

Scripts globais (sem modulos), estado `S` em localStorage `corrente-estudos-v1`. Ordem de carga em index.html (core primeiro). lostaudio.js = audio base64 (4,8MB), highlight.min.js = lib.

## js/awards.js (54KB)
- Define: CATS, DONE, GEN0, LANG0, LOGY, MEMO, TOPN, addK, awTab, badge, best, build, byCat, card (+43)
- Estado S: aw, ch, elos, leg, log, lz, shop, subjects
- Usa de: core.js(DIAS, addD, diff); contratos-feed.js(name, span, total); lumi-ia.js(dias, nome, recordes); painel-render.js(before, render, toast); semana-historico.js(PAGES, date, route)

## js/coach.js (12KB)
- Define: CO_F, CO_PH, CO_TP, coCfg, coData, coInsights, coPlan, coSlots, coTip, fqAll, hours, last, left, need (+6)
- Estado S: coach, log, subjects
- Usa de: lazer-loja.js(lzBal, lzCfg, lzStep); contratos-feed.js(name, renderFeed, span); core.js(addD, diff, save); metas-provas.js(exams, impOf); notas.js(select, wrap)

## js/como-funciona.js (9KB)
- Define: build, difTable, draw, ensure
- Estado S: dif
- Usa de: awards.js(build, draw, ensure); semana-historico.js(PAGES, route); coach.js(left); contratos-feed.js(total); core.js(streak)

## js/contratos-feed.js (14KB)
- Define: MESES, active, activeCards, activeSec, cells, cfBanner, cfCfg, cfEval, feedSub, form, goalCard, goalInfo, histList, histSec (+17)
- Estado S: cf, ch, log, lz, mg, rev, rw, subjects, xb
- Usa de: core.js(DIAS, addD, diff); painel-render.js(dayStudy, dayTop, render); awards.js(badge, days, first); coach.js(left, need, today); semana-historico.js(date, renderWeek, viewSeg)

## js/core.js (3KB)
- Define: COLORS, DIAS, MARKS, addD, agoTxt, best, clearDay, diff, gstreak, load, mins, monday, parse, regDay (+3)
- Estado S: log, rec
- Usa de: awards.js(best, days); lazer-loja.js(lzRefundDay, stkSets); corrente.js(prev); lazer-estatisticas.js(view); lumi.js(keys)

## js/corrente.js (19KB)
- Define: CH_DP, CH_NIV, chAdj, chAvg, chCast, chCfg, chDay, chDayEval, chDayOpts, chDc, chDesc, chEnd, chErr, chEval (+25)
- Estado S: ch, log, subjects
- Usa de: contratos-feed.js(cells, items, list); core.js(DIAS, addD, diff); lazer-loja.js(elosAdd, lzCfg, lzId); metas-provas.js(DNAMES, start, xpRun); painel-render.js(render, title, toast)

## js/faculdade.js (59KB)
- Define: OPEN, addBtn, alerts, answer, bEnt, bFal, bNotas, bOf0, bOferta, boost, brief, bust, cand, card (+53)
- Estado S: faculdade, subjects
- Usa de: contratos-feed.js(items, list, name); awards.js(card, days, draw); coach.js(last, left, need); lumi-ia.js(calc, dias, nome); painel-render.js(render, title, toast)

## js/lazer-estatisticas.js (22KB)
- Define: CATS, badge, bars, best, blob, build, chart, consec, days, dharma, dkey, evRows, fails, inCat (+8)
- Estado S: lost, lz
- Usa de: awards.js(CATS, badge, best); lazer-loja.js(body, lzBal, lzCfg); contratos-feed.js(html, items, span); lost-terminal.js(idle, lost, test); relatorios.js(head, line, real)

## js/lazer-loja.js (52KB)
- Define: LP_M, LP_T, PDL_FLOOR, SHOP, STEPN, body, carry, days, elBal, elCfg, elosAdd, fits, idCfg, idCharge (+71)
- Estado S: brk, elos, idl, lz, lzp, shop, stk, subjects, timer
- Usa de: metas-provas.js(impOf, renderLvl, start); painel-render.js(notify, render, title); relatorios.js(debt, line, over); coach.js(last, left, need); contratos-feed.js(name, span, text)

## js/ligas-bots.js (5KB)
- Define: addK, bots, build, frac, hash, hist, inject, rank, stay
- Estado S: 
- Usa de: awards.js(addK, build, from); core.js(addD, monday, parse); ligas.js(fmtH, wkOf); contratos-feed.js(name); lumi-ia.js(dias)

## js/ligas.js (7KB)
- Define: addK, firstStudy, fmtH, init, lastDone, lastE, ligaRender, need, proj, settle, wkOf, zone
- Estado S: leg, subjects
- Usa de: core.js(addD, monday, parse); awards.js(addK, days, from); coach.js(last, left, need); contratos-feed.js(items, span, text); lazer-loja.js(right, stkTot)

## js/loja-v2.js (12KB)
- Define: card, ganho, pick, recs, secs, tabs, vault, vaultSettle, wallet
- Estado S: 
- Usa de: lazer-loja.js(SHOP, elBal, elCfg); core.js(DIAS, addD, parse); painel-render.js(render, title, toast); contratos-feed.js(items, span, text); awards.js(card, from)

## js/lost-terminal.js (15KB)
- Define: CODE, fail, idOn, idle, init, lost, migr, nextB, prepare, pzAt, pzMsg, pzNow, setBuf, setD (+5)
- Estado S: lost
- Usa de: lazer-loja.js(elosAdd, idCfg, idTick); metas-provas.js(lvInfo, renderLvl, start); awards.js(best, prep); contratos-feed.js(span, total); core.js(save, streak)

## js/lumi-ia.js (70KB)
- Define: MESN, SYS2, SYS3, SYS4, addNote, addProva, agoraLocal, atualizarPerfil, build, busy, calc, calibAn, clean, code (+65)
- Estado S: ai, lchk, lexp, lnotes, log, lperfil, lprovas, lrisk, lsug, rev, subjects
- Usa de: lazer-loja.js(LP_M, SHOP, body); coach.js(coCfg, coData, coInsights); awards.js(best, build, days); contratos-feed.js(active, cfCfg, items); metas-provas.js(NOMES, diffOf, exams)

## js/lumi.js (87KB)
- Define: IORD, LONG, SEVI, aMateria, aProvas, aResumo, aTarefas, act3, addQ, analyze, apply3, ask3, badge3, baseTxt (+58)
- Estado S: log, lost, lumi, subjects
- Usa de: lazer-loja.js(SHOP, elBal, idHM); coach.js(coData, coPlan, hours); core.js(addD, diff, gstreak); metas-provas.js(DIFF, IMPW, diffOf); contratos-feed.js(goalInfo, items, list)

## js/metas-provas.js (28KB)
- Define: ATOS, DIFF, DNAMES, IMPW, NOMES, SCOPE, TYPE, XB_RATE, cards, contProg, diffOf, diffSel, exOpen, exams (+44)
- Estado S: log, lvSeen, mg, rev, subjects, xb, xpv
- Usa de: contratos-feed.js(form, goalInfo, name); coach.js(last, left, need); core.js(addD, diff, monday); painel-render.js(detail, render, setDone); lumi-ia.js(dias, late, nome)

## js/nivel-dificuldade.js (3KB)
- Define: RAMPA, difInit, difUpdate, floorAt, minF, withIdle
- Estado S: dif
- Usa de: lazer-loja.js(idCfg, idCharge, idRetro); core.js(addD, diff, parse); metas-provas.js(lvInfo, renderLvl, xpRun); painel-render.js(render, toast); awards.js(from)

## js/notas.js (24KB)
- Define: addImgs, comp, desc, draw, drawAll, drawMain, drawTree, ensure, exportMd, flush, fmtIns, hydrate, idbDel, idbGet (+15)
- Estado S: notas
- Usa de: contratos-feed.js(items, name, span); painel-render.js(render, title, toast); awards.js(draw, ensure); faculdade.js(desc, info); lazer-loja.js(body, used)

## js/painel-render.js (60KB)
- Define: TECH, after, askTask, bars, beep, before, brkHtml, bySub, cards, chain, dayDet, dayStudy, dayTop, detId (+51)
- Estado S: bd, bdv, brk, cf, log, nt, rec, subjects, timer, tmPref, tmTech
- Usa de: contratos-feed.js(cfCfg, cfEval, form); core.js(COLORS, DIAS, MARKS); lazer-loja.js(body, idSet, idStudy); metas-provas.js(cards, diffSel, impOf); registro-foco.js(FOCUS_OPT, addLog, allTot)

## js/registro-foco.js (11KB)
- Define: BUCKETS, FOCUS_OPT, addLog, allTot, askSession, bestS, goalLabel, impAt, impU, lgLine, mkUnp, parts, plOf, plTot (+12)
- Estado S: log, mg, rw, subjects
- Usa de: metas-provas.js(DNAMES, impOf, mgCalc); contratos-feed.js(items, name, span); awards.js(days, from, parts); core.js(addD, monday, save); lazer-loja.js(elCfg, lzBonus, lzCfg)

## js/relatorios.js (69KB)
- Define: PL_CAP, Teff, allDayMap, avg7, avgAct, avgPrev, cells, dayChart, dayList, daySes, days, debt, dist, doneNow (+66)
- Estado S: brk, fw, log, mg, planSnap, refl, repSeen, rev, snap, subjects
- Usa de: metas-provas.js(DNAMES, diffSel, exams); contratos-feed.js(MESES, cells, cfBanner); awards.js(best, days, first); coach.js(last, left, need); core.js(DIAS, addD, gstreak)

## js/rotinas.js (23KB)
- Define: ICON, adopt, nowMin, rows, rtAg, rtDetail, rtHtml, rtList, rtView, strip, time
- Estado S: rot, subjects
- Usa de: relatorios.js(head, line, real); contratos-feed.js(items, name, opts); faculdade.js(done, prio, subj); painel-render.js(render, title, toast); awards.js(parts, rows)

## js/semana-historico.js (36KB)
- Define: PAGES, allTasks, autoScroll, axis, beginDrag, colAt, cols, date, ddSessDay, dragEnd, dragMove, dragStart, dragUpdate, dur0 (+36)
- Estado S: log, subjects
- Usa de: painel-render.js(dayStudy, dayTop, detId); contratos-feed.js(MESES, active, items); lazer-loja.js(body, lzBonus, lzCfg); core.js(DIAS, addD, monday); registro-foco.js(allTot, impAt, lgLine)

## js/tarefas.js (8KB)
- Define: body, late, tkAdd, tkDay, tkHtml, tkKeep, tkRow, tkWk
- Estado S: subjects
- Usa de: contratos-feed.js(list, name, opts); core.js(addD, diff, monday); semana-historico.js(allTasks, cols, date); painel-render.js(render, title, toast); faculdade.js(done, prio)
