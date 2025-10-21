<?php

namespace TransactionsApp\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use TransactionsApp\Models\Category;

class CategoryController
{
    private Category $categoryModel;

    public function __construct(Category $categoryModel)
    {
        $this->categoryModel = $categoryModel;
    }

    /**
     * Get all categories
     */
    public function index(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $type = $queryParams['type'] ?? null;

        try {
            $categories = $this->categoryModel->getAll($type);
            return $this->jsonResponse($response, ['data' => $categories]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a single category
     */
    public function show(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];

        try {
            $category = $this->categoryModel->getById($id);
            
            if (!$category) {
                return $this->jsonResponse($response, ['error' => 'Category not found'], 404);
            }

            return $this->jsonResponse($response, ['data' => $category]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new category
     */
    public function create(Request $request, Response $response): Response
    {
        $data = json_decode((string) $request->getBody(), true);

        // Validate required fields
        $required = ['name', 'type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required"], 400);
            }
        }

        // Validate type
        if (!in_array($data['type'], ['income', 'expense'])) {
            return $this->jsonResponse($response, ['error' => 'Type must be either income or expense'], 400);
        }

        try {
            $category = $this->categoryModel->create($data);
            return $this->jsonResponse($response, ['data' => $category], 201);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to return JSON response
     */
    private function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
