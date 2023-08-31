// Verify borrower identity and acc
check for account name
check for verified bvn
check for when accounts was created

//analysis
//analysis();

//update loan schema
'borrower.finInfo.customerId': data.auth.customer_id,
'borrower.finInfo.clientId': data.auth.clientId,
'borrower.finInfo.auth_method': data.auth.login_type,
'borrower.finInfo.institution_name': data.bank_details.name,
'borrower.finInfo.institution_id': data.bank_details._id,
'borrower.finInfo.institution_code': data.identity.enrollment.bank,
'borrower.finInfo.accounts': data.accounts,
'borrower.finInfo.bvn': data.identity.bvn,
'borrower.finInfo.nin': data.identity.nin,

wf {
	connect via widget
	
}

if ecocheck does not find user {
	go ahead to crccheck
} else if ecocheck finds user {
	analyse user ecohistory
	if history is negative {
		break and present final result
	} else {
		go ahead to crccheck
	}
}

function crccheck() {
	if crc does not find user {
		go ahead to fincheck
	} else if crc finds user {
		analyse user crc history 
		if history is negative {
			break and present final result
		} else {
			go ahead to fincheck
		}
	}
}