<?php
$pdo = new PDO('sqlite:/Users/andreaslee-norman/Sites/transactions-app/data/database.sqlite');
$stmt = $pdo->query('SELECT name, type FROM categories ORDER BY type, name');
echo "Database Categories:\n";
echo "==================\n";
while ($row = $stmt->fetch()) {
	echo $row['type'] . ': ' . $row['name'] . "\n";
}
