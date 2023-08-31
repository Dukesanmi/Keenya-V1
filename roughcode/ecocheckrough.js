	log('eco found');
				const ecocheck = ecocheckcalc(lendsqrecosystemcheck.data);
				if (ecocheck === false) {
					result.analyse = false
					result.eligible = false
					result.note = "Poor Credit History"
			    	log('after obj update');
				}
				else {
					log('crc entered');
					// Credit Bureau
					const crccheck = await creditbureaucheck(data.identity.bvn);
					if (crccheck.message === "Successful") {
						const crcbureau = crccheckcalc(crccheck.data);
						log('crc done');
						if (crcbureau === false) {
							result.analyse = false
							result.eligible = false
							result.note = "Poor Credit History"
						} else {
							// Financial Analysis
							// Get transactions date range
							const dateRange = getTransactionRange();
							log('finance check');
							const financials = await transactions(dateRange, data.auth.customer_id);
							const analysefinancials = analyseAmounts(financials, totalLoan);
							if (analysefinancials) {
								result.analyse = analysefinancials.analyse
								result.eligible = analysefinancials.eligible
								result.note = analysefinancials.note
							}
						}
					}
				}

const ecocheck = ecocheckcalc(lendsqrecosystemcheck.data);
				if (ecocheck === false) {
					result.analyse = false
					result.eligible = false
					result.note = "Poor Credit History"
			    	log('after obj update');
				}
				else if (lendsqrecosystemcheck.message === `${data.identity.bvn} not found in ecosystem` || ecocheck === true) {
					log('crc entered');
					// Credit Bureau
					const crccheck = await creditbureaucheck(data.identity.bvn);
					if (crccheck.message === "Successful") {
						const crcbureau = crccheckcalc(crccheck.data);
						log('crc done');
						if (crcbureau === false) {
							result.analyse = false
							result.eligible = false
							result.note = "Poor Credit History"
						} else if (crcbureau === true || crccheck.message === 'No CRC History') {
							// Financial Analysis
							// Get transactions date range
							const dateRange = getTransactionRange();
							log('finance check');
							const financials = await transactions(dateRange, data.auth.customer_id);
							const analysefinancials = analyseAmounts(financials, totalLoan);
							if (analysefinancials) {
								result.analyse = analysefinancials.analyse
								result.eligible = analysefinancials.eligible
								result.note = analysefinancials.note
							}
						}
					}
				}