<?php
$pdo = new PDO('sqlite:/Users/andreaslee-norman/Sites/transactions-app/data/database-local.sqlite');
$stmt = $pdo->query('SELECT name FROM sqlite_master WHERE type="table"');
echo "Tables in database:\n";
while ($row = $stmt->fetch()) {
	echo "- " . $row['name'] . "\n";
}
